'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { getTreeBySlug, rollTreeReward, TREE_CATALOGUE } from '@/lib/tree-catalogue';
import type { GardenState, PlantedTree, Tree } from '@/types/trees';

const STORAGE_KEY = 'ecolife_garden_v1';

const DEFAULT_COLS = 16;
const DEFAULT_ROWS = 11;

export const INITIAL_GARDEN_STATE: GardenState = {
  gridCols: DEFAULT_COLS,
  gridRows: DEFAULT_ROWS,
  playerPos: { x: 7, y: 5, direction: 'down' },
  activeHotbarIndex: 0,
  plantedTrees: [
    {
      instanceId: 'starter-neem-1',
      treeSlug: 'neem',
      x: 3,
      y: 3,
      plantedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      growthStage: 4,
    },
    {
      instanceId: 'starter-mango-1',
      treeSlug: 'mango',
      x: 12,
      y: 3,
      plantedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      growthStage: 4,
    },
    {
      instanceId: 'starter-amaltas-1',
      treeSlug: 'amaltas',
      x: 3,
      y: 7,
      plantedAt: new Date(Date.now() - 86400000).toISOString(),
      growthStage: 3,
    },
  ],
  inventory: [
    { treeSlug: 'neem', quantity: 2 },
    { treeSlug: 'mango', quantity: 2 },
    { treeSlug: 'gulmohar', quantity: 1 },
    { treeSlug: 'amaltas', quantity: 1 },
    { treeSlug: 'jacaranda', quantity: 1 },
    { treeSlug: 'peepal', quantity: 1 },
  ],
  hotbar: ['neem', 'mango', 'gulmohar', 'amaltas', 'jacaranda', 'peepal'],
  stats: {
    totalPlanted: 3,
    totalOffsetKgPerYear: 118.5,
    timesWatered: 2,
  },
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
      const saved = localStorage.getItem(STORAGE_KEY);
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

  // Check if a tile has obstacles (fence, pond, or planted tree)
  const isTileBlocked = React.useCallback(
    (x: number, y: number, currentPlanted = state.plantedTrees) => {
      // Perimeter fence
      if (x <= 0 || x >= state.gridCols - 1 || y <= 0 || y >= state.gridRows - 1) {
        return true;
      }
      // Garden decorative pond at (7, 7) and (8, 7)
      if ((x === 7 || x === 8) && (y === 7 || y === 8)) {
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
          newY >= prev.gridRows - 1 ||
          ((newX === 7 || newX === 8) && (newY === 7 || newY === 8))
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
  };
}
