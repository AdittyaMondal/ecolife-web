'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { getTreeBySlug, rollTreeReward, TREE_CATALOGUE } from '@/lib/tree-catalogue';
import type {
  CharacterSkinId,
  GardenBiomeId,
  GardenState,
  PetId,
  PlantedTree,
  ShopItemBiome,
  ShopItemPet,
  ShopItemSkin,
  Tree,
} from '@/types/trees';

const STORAGE_KEY = 'ecolife_garden_v2';

const DEFAULT_COLS = 16;
const DEFAULT_ROWS = 11;

export const INITIAL_GARDEN_STATE: GardenState = {
  gridCols: DEFAULT_COLS,
  gridRows: DEFAULT_ROWS,
  playerPos: { x: 7, y: 5, direction: 'down' },
  activeHotbarIndex: 0,
  // Garden starts completely clean and empty — the user places all trees!
  plantedTrees: [],
  inventory: [
    { treeSlug: 'neem', quantity: 3 },
    { treeSlug: 'mango', quantity: 3 },
    { treeSlug: 'gulmohar', quantity: 2 },
    { treeSlug: 'amaltas', quantity: 2 },
    { treeSlug: 'jacaranda', quantity: 2 },
    { treeSlug: 'peepal', quantity: 2 },
  ],
  hotbar: ['neem', 'mango', 'gulmohar', 'amaltas', 'jacaranda', 'peepal'],
  stats: {
    totalPlanted: 0,
    totalOffsetKgPerYear: 0,
    timesWatered: 0,
  },
  activeSkinId: 'gardener_default',
  unlockedSkins: ['gardener_default'],
  activeBiomeId: 'meadow',
  unlockedBiomes: ['meadow'],
  unlockedPets: ['dog'],
  activePetIds: ['dog'],
};

function calculateTotalOffset(planted: PlantedTree[]): number {
  return planted.reduce((acc, pt) => {
    const tree = getTreeBySlug(pt.treeSlug);
    return acc + (tree?.co2OffsetKgPerYear || 0);
  }, 0);
}

export function useGarden() {
  const [state, setState] = React.useState<GardenState>(INITIAL_GARDEN_STATE);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [movingTreeFrom, setMovingTreeFrom] = React.useState<{ x: number; y: number } | null>(null);

  // Load from localStorage on mount
  React.useEffect(() => {
    try {
      let saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        // Check for legacy v1 state and migrate by clearing starter trees
        const legacy = localStorage.getItem('ecolife_garden_v1');
        if (legacy) {
          const parsed = JSON.parse(legacy);
          // Remove default starter trees so user starts with an empty garden
          parsed.plantedTrees = (parsed.plantedTrees || []).filter(
            (t: PlantedTree) => !t.instanceId?.startsWith('starter-'),
          );
          parsed.stats = {
            totalPlanted: parsed.plantedTrees.length,
            totalOffsetKgPerYear: calculateTotalOffset(parsed.plantedTrees),
            timesWatered: parsed.stats?.timesWatered || 0,
          };
          saved = JSON.stringify(parsed);
          localStorage.setItem(STORAGE_KEY, saved);
        }
      }

      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure stats and hotbar integrity
        if (!parsed.stats) {
          parsed.stats = {
            totalPlanted: parsed.plantedTrees?.length || 0,
            totalOffsetKgPerYear: calculateTotalOffset(parsed.plantedTrees || []),
            timesWatered: 0,
          };
        }
        setState(parsed);
      }
    } catch (e) {
      console.warn('Could not load garden state from localStorage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage when state updates
  const saveState = React.useCallback((newState: GardenState) => {
    setState(newState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (e) {
      console.warn('Could not save garden state:', e);
    }
  }, []);

  // Check if a tile has obstacles (fence or planted tree)
  const isTileBlocked = React.useCallback(
    (x: number, y: number, currentPlanted = state.plantedTrees) => {
      // Perimeter fence
      if (x <= 0 || x >= state.gridCols - 1 || y <= 0 || y >= state.gridRows - 1) {
        return true;
      }
      // Planted tree
      return currentPlanted.some((t) => t.x === x && t.y === y);
    },
    [state.gridCols, state.gridRows, state.plantedTrees],
  );

  // Move Player
  const movePlayer = React.useCallback(
    (dx: number, dy: number, direction: 'up' | 'down' | 'left' | 'right') => {
      setState((prev) => {
        const newX = prev.playerPos.x + dx;
        const newY = prev.playerPos.y + dy;

        // Check bounds & obstacles for player walk
        if (
          newX <= 0 ||
          newX >= prev.gridCols - 1 ||
          newY <= 0 ||
          newY >= prev.gridRows - 1
        ) {
          // Just change facing direction if blocked
          const updated = {
            ...prev,
            playerPos: { ...prev.playerPos, direction },
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          return updated;
        }

        const updated: GardenState = {
          ...prev,
          playerPos: { x: newX, y: newY, direction },
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    [],
  );

  // Get tile coordinate currently faced by player
  const getFacingTile = React.useCallback(() => {
    const { x, y, direction } = state.playerPos;
    let targetX = x;
    let targetY = y;
    if (direction === 'up') targetY -= 1;
    if (direction === 'down') targetY += 1;
    if (direction === 'left') targetX -= 1;
    if (direction === 'right') targetX += 1;
    return { x: targetX, y: targetY };
  }, [state.playerPos]);

  // Plant Tree from Hotbar/Inventory to (x, y)
  const plantTree = React.useCallback(
    (targetX: number, targetY: number, treeSlug?: string) => {
      const slugToPlant = treeSlug || state.hotbar[state.activeHotbarIndex];
      if (!slugToPlant) {
        toast.error('Select a tree from your hotbar to plant it.');
        return false;
      }

      // Check if tile is blocked
      if (isTileBlocked(targetX, targetY)) {
        toast.error('This tile is blocked or already has a tree planted.');
        return false;
      }

      // Check inventory
      const invItem = state.inventory.find((i) => i.treeSlug === slugToPlant);
      if (!invItem || invItem.quantity <= 0) {
        toast.error(`You have no more ${slugToPlant} trees left in inventory.`);
        return false;
      }

      const treeDef = getTreeBySlug(slugToPlant);
      const newPlanted: PlantedTree = {
        instanceId: `tree-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        treeSlug: slugToPlant,
        x: targetX,
        y: targetY,
        plantedAt: new Date().toISOString(),
        growthStage: 2, // starts as young sapling
      };

      const updatedPlanted = [...state.plantedTrees, newPlanted];
      const updatedInventory = state.inventory
        .map((item) =>
          item.treeSlug === slugToPlant ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0);

      // If quantity ran out, keep hotbar slot or clear
      const updatedState: GardenState = {
        ...state,
        plantedTrees: updatedPlanted,
        inventory: updatedInventory,
        stats: {
          ...state.stats,
          totalPlanted: state.stats.totalPlanted + 1,
          totalOffsetKgPerYear: calculateTotalOffset(updatedPlanted),
        },
      };

      saveState(updatedState);
      toast.success(
        `Planted a ${treeDef?.name || slugToPlant}! +${treeDef?.co2OffsetKgPerYear} kg CO₂/yr`,
      );
      return true;
    },
    [state, isTileBlocked, saveState],
  );

  // Remove Planted Tree and return to inventory
  const removeTree = React.useCallback(
    (targetX: number, targetY: number) => {
      const treeIndex = state.plantedTrees.findIndex((t) => t.x === targetX && t.y === targetY);
      if (treeIndex === -1) {
        toast.error('There is no tree here to remove.');
        return false;
      }

      const treeToRemove = state.plantedTrees[treeIndex];
      const treeDef = getTreeBySlug(treeToRemove.treeSlug);

      const updatedPlanted = state.plantedTrees.filter((_, idx) => idx !== treeIndex);

      // Return tree to inventory
      const existingInvIndex = state.inventory.findIndex(
        (i) => i.treeSlug === treeToRemove.treeSlug,
      );
      const updatedInventory = [...state.inventory];
      if (existingInvIndex >= 0) {
        updatedInventory[existingInvIndex].quantity += 1;
      } else {
        updatedInventory.push({ treeSlug: treeToRemove.treeSlug, quantity: 1 });
      }

      const updatedState: GardenState = {
        ...state,
        plantedTrees: updatedPlanted,
        inventory: updatedInventory,
        stats: {
          ...state.stats,
          totalOffsetKgPerYear: calculateTotalOffset(updatedPlanted),
        },
      };

      saveState(updatedState);
      toast.success(`Returned ${treeDef?.name || treeToRemove.treeSlug} to your inventory.`);
      return true;
    },
    [state, saveState],
  );

  // Move Tree: Pick up or drop
  const toggleMoveTree = React.useCallback(
    (targetX: number, targetY: number) => {
      if (!movingTreeFrom) {
        // Pick up tree
        const tree = state.plantedTrees.find((t) => t.x === targetX && t.y === targetY);
        if (!tree) {
          toast.error('Select a planted tree to move.');
          return false;
        }
        setMovingTreeFrom({ x: targetX, y: targetY });
        toast.info(
          `Selected tree at (${targetX}, ${targetY}). Now click or move to an empty tile to place it.`,
        );
        return true;
      }

      // Drop tree on new tile
      if (isTileBlocked(targetX, targetY)) {
        toast.error('Cannot place tree here. Destination tile is blocked.');
        return false;
      }

      const treeIndex = state.plantedTrees.findIndex(
        (t) => t.x === movingTreeFrom.x && t.y === movingTreeFrom.y,
      );
      if (treeIndex === -1) {
        setMovingTreeFrom(null);
        return false;
      }

      const updatedPlanted = [...state.plantedTrees];
      updatedPlanted[treeIndex] = {
        ...updatedPlanted[treeIndex],
        x: targetX,
        y: targetY,
      };

      saveState({
        ...state,
        plantedTrees: updatedPlanted,
      });

      setMovingTreeFrom(null);
      toast.success('Tree relocated successfully!');
      return true;
    },
    [movingTreeFrom, state, isTileBlocked, saveState],
  );

  // Water Tree
  const waterTree = React.useCallback(
    (targetX: number, targetY: number) => {
      const treeIndex = state.plantedTrees.findIndex((t) => t.x === targetX && t.y === targetY);
      if (treeIndex === -1) {
        toast.error('No tree here to water.');
        return false;
      }

      const updatedPlanted = [...state.plantedTrees];
      const current = updatedPlanted[treeIndex];
      const nextStage = Math.min(current.growthStage + 1, 4);

      updatedPlanted[treeIndex] = {
        ...current,
        growthStage: nextStage,
        wateredAt: new Date().toISOString(),
      };

      saveState({
        ...state,
        plantedTrees: updatedPlanted,
        stats: {
          ...state.stats,
          timesWatered: state.stats.timesWatered + 1,
        },
      });

      const treeDef = getTreeBySlug(current.treeSlug);
      toast.success(
        `Watered ${treeDef?.name}! Growth stage: ${
          nextStage === 4 ? 'Full Bloom 🌸' : `Stage ${nextStage}`
        }`,
      );
      return true;
    },
    [state, saveState],
  );

  // Set Hotbar active index (0..5)
  const setActiveHotbarIndex = React.useCallback((index: number) => {
    setState((prev) => ({ ...prev, activeHotbarIndex: index }));
  }, []);

  // Assign a tree slug to a hotbar slot
  const assignToHotbar = React.useCallback(
    (slotIndex: number, treeSlug: string | null) => {
      const newHotbar = [...state.hotbar];
      newHotbar[slotIndex] = treeSlug;
      saveState({ ...state, hotbar: newHotbar });
    },
    [state, saveState],
  );

  // Claim Daily Mystery Seed Reward
  const claimReward = React.useCallback((): Tree => {
    const awarded = rollTreeReward();

    const existingInvIndex = state.inventory.findIndex((i) => i.treeSlug === awarded.slug);
    const updatedInventory = [...state.inventory];
    if (existingInvIndex >= 0) {
      updatedInventory[existingInvIndex].quantity += 1;
    } else {
      updatedInventory.push({ treeSlug: awarded.slug, quantity: 1 });
    }

    // Auto-fill an empty hotbar slot if available
    const emptySlot = state.hotbar.findIndex((s) => s === null);
    const updatedHotbar = [...state.hotbar];
    if (emptySlot !== -1 && !state.hotbar.includes(awarded.slug)) {
      updatedHotbar[emptySlot] = awarded.slug;
    }

    saveState({
      ...state,
      inventory: updatedInventory,
      hotbar: updatedHotbar,
    });

    return awarded;
  }, [state, saveState]);

  // Equip an unlocked character skin
  const equipSkin = React.useCallback(
    (skinId: CharacterSkinId) => {
      saveState({ ...state, activeSkinId: skinId });
      toast.success('Equipped new character skin!');
    },
    [state, saveState],
  );

  // Buy and equip character skin with EcoCoins
  const buyAndEquipSkin = React.useCallback(
    (skin: ShopItemSkin, userCoins: number): boolean => {
      if (skin.priceCoins > userCoins) {
        toast.error(`Not enough EcoCoins! You have ${userCoins} and need ${skin.priceCoins}.`);
        return false;
      }
      const unlocked = Array.from(
        new Set([...(state.unlockedSkins || ['gardener_default']), skin.id]),
      );
      saveState({
        ...state,
        unlockedSkins: unlocked,
        activeSkinId: skin.id,
      });
      toast.success(`Purchased and equipped ${skin.name}!`);
      return true;
    },
    [state, saveState],
  );

  // Equip an unlocked biome / layout
  const equipBiome = React.useCallback(
    (biomeId: GardenBiomeId) => {
      saveState({ ...state, activeBiomeId: biomeId });
      toast.success('Applied garden biome!');
    },
    [state, saveState],
  );

  // Buy and equip biome layout with EcoCoins
  const buyAndEquipBiome = React.useCallback(
    (biome: ShopItemBiome, userCoins: number): boolean => {
      if (biome.priceCoins > userCoins) {
        toast.error(`Not enough EcoCoins! You have ${userCoins} and need ${biome.priceCoins}.`);
        return false;
      }
      const unlocked = Array.from(new Set([...(state.unlockedBiomes || ['meadow']), biome.id]));
      saveState({
        ...state,
        unlockedBiomes: unlocked,
        activeBiomeId: biome.id,
      });
      toast.success(`Purchased and applied ${biome.name} biome!`);
      return true;
    },
    [state, saveState],
  );

  // Toggle pet roaming in garden
  const togglePetRoam = React.useCallback(
    (petId: PetId) => {
      const currentActive = state.activePetIds || ['dog'];
      let nextActive: PetId[];
      if (currentActive.includes(petId)) {
        nextActive = currentActive.filter((id) => id !== petId);
        toast.info('Pet returned to sanctuary.');
      } else {
        nextActive = [...currentActive, petId];
        toast.success('Pet is now roaming freely in your garden!');
      }
      saveState({ ...state, activePetIds: nextActive });
    },
    [state, saveState],
  );

  // Buy pet with EcoCoins
  const buyPet = React.useCallback(
    (pet: ShopItemPet, userCoins: number): boolean => {
      if (pet.priceCoins > userCoins) {
        toast.error(`Not enough EcoCoins! You have ${userCoins} and need ${pet.priceCoins}.`);
        return false;
      }
      const unlocked = Array.from(new Set([...(state.unlockedPets || ['dog']), pet.id]));
      const active = Array.from(new Set([...(state.activePetIds || ['dog']), pet.id]));
      saveState({
        ...state,
        unlockedPets: unlocked,
        activePetIds: active,
      });
      toast.success(`Adopted ${pet.name}! They are now roaming in your garden.`);
      return true;
    },
    [state, saveState],
  );

  return {
    state,
    isLoaded,
    movingTreeFrom,
    movePlayer,
    getFacingTile,
    plantTree,
    removeTree,
    toggleMoveTree,
    waterTree,
    setActiveHotbarIndex,
    assignToHotbar,
    claimReward,
    isTileBlocked,
    equipSkin,
    buyAndEquipSkin,
    equipBiome,
    buyAndEquipBiome,
    togglePetRoam,
    buyPet,
  };
}
