'use client';

import * as React from 'react';
import {
  drawFenceTile,
  drawGardener,
  drawGrassTile,
  drawPathTile,
  drawTreeSprite,
  drawWaterTile,
  TILE_SIZE,
} from '@/components/blocks/garden/pixel-sprites';
import { getTreeBySlug } from '@/lib/tree-catalogue';
import type { GardenState, PetId, PlantedTree } from '@/types/trees';

interface ActivePetState {
  id: PetId;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  facing: 'left' | 'right';
  state: 'idle' | 'walking';
  timer: number;
  speed: number;
}

export interface GardenCanvasProps {
  state: GardenState;
  movingTreeFrom: { x: number; y: number } | null;
  onTileClick: (x: number, y: number) => void;
  onMovePlayer: (dx: number, dy: number, dir: 'up' | 'down' | 'left' | 'right') => void;
  onActionPlant: () => void;
  onActionRemove: () => void;
  onActionWater: () => void;
  onActionMove: () => void;
  onSelectHotbar: (idx: number) => void;
  activeTool: 'plant' | 'water' | 'remove' | 'move';
}

export function GardenCanvas({
  state,
  movingTreeFrom,
  onTileClick,
  onMovePlayer,
  onActionPlant,
  onActionRemove,
  onActionWater,
  onActionMove,
  onSelectHotbar,
  activeTool,
}: GardenCanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [hoveredTile, setHoveredTile] = React.useState<{ x: number; y: number } | null>(null);
  const [isWalking, setIsWalking] = React.useState(false);
  const [inspectedTree, setInspectedTree] = React.useState<PlantedTree | null>(null);

  const totalWidth = state.gridCols * TILE_SIZE;
  const totalHeight = state.gridRows * TILE_SIZE;

  // Cache for loaded tree sprite PNG images
  const treeImageCacheRef = React.useRef<Map<string, HTMLImageElement>>(new Map());
  // Cache for loaded character sprite PNG images (multi-frame)
  const characterImageCacheRef = React.useRef<Map<string, HTMLImageElement>>(new Map());
  // Cache for loaded biome tile PNG images
  const tileImageCacheRef = React.useRef<Map<string, HTMLImageElement>>(new Map());
  // Cache for full unified empty garden layout map images
  const mapImageCacheRef = React.useRef<Map<string, HTMLImageElement>>(new Map());
  // Cache for free-roaming companion pet sprite images
  const petImageCacheRef = React.useRef<Map<string, HTMLImageElement>>(new Map());

  // Autonomous wandering pets state map
  const petsRef = React.useRef<Map<PetId, ActivePetState>>(new Map());

  // Preload tree sprites, multi-frame character sprites & biome tiles
  React.useEffect(() => {
    // 1. Tree catalogue sprites
    const treeSlugs = [
      'neem',
      'mango',
      'amaltas',
      'gulmohar',
      'jacaranda',
      'banyan',
      'peepal',
      'red-sanders',
      'palash',
      'sandalwood',
      'teak',
      'amla',
      'guava',
      'curry-leaf',
      'drumstick',
      'tamarind',
      'jamun',
      'bael',
      'kadamba',
      'arjuna',
      'papaya',
      'hibiscus',
    ];

    for (const slug of treeSlugs) {
      if (!treeImageCacheRef.current.has(slug)) {
        const img = new Image();
        img.src = `/trees/${slug}.png`;
        treeImageCacheRef.current.set(slug, img);
      }
    }

    // 2. Character multi-frame sprites for all 5 skins
    const skins = [
      'gardener_default',
      'forest_ranger',
      'solar_scout',
      'monsoon_botanist',
      'zen_hermit',
    ];
    const dirs = ['down', 'up', 'side'];
    const frames = [0, 1, 2];

    for (const skin of skins) {
      for (const dir of dirs) {
        for (const frame of frames) {
          const key = `${skin}_${dir}_${frame}`;
          if (!characterImageCacheRef.current.has(key)) {
            const img = new Image();
            img.src = `/sprites/${key}.png`;
            characterImageCacheRef.current.set(key, img);
          }
        }
      }
    }

    // 3. Preload all unified empty garden layout map images
    const biomes = [
      'meadow',
      'zen_bamboo',
      'autumn_orchard',
      'sacred_grove',
      'desert_oasis',
      'crystal_glade',
    ];
    for (const biome of biomes) {
      if (!mapImageCacheRef.current.has(biome)) {
        const img = new Image();
        img.src = `/maps/${biome}.png`;
        mapImageCacheRef.current.set(biome, img);
      }
    }

    // 4. Biome tilesets fallback (grass, path, water, fence)
    const tileTypes = ['grass', 'path', 'water', 'fence'];

    for (const biome of biomes) {
      for (const t of tileTypes) {
        const key = `${biome}_${t}`;
        if (!tileImageCacheRef.current.has(key)) {
          const img = new Image();
          img.src = `/tiles/${key}.png`;
          tileImageCacheRef.current.set(key, img);
        }
      }
    }

    // 5. Preload all free-roaming companion pet sprites (walk & special idle)
    const petIds = ['dog', 'cat', 'horse', 'tiger', 'peacock', 'unicorn', 'pegasus'];
    const petAnims = ['walk_0', 'walk_1', 'walk_2', 'idle_0', 'idle_1', 'idle_2'];

    for (const p of petIds) {
      for (const a of petAnims) {
        const key = `${p}_${a}`;
        if (!petImageCacheRef.current.has(key)) {
          const img = new Image();
          img.src = `/sprites/pets/${key}.png`;
          petImageCacheRef.current.set(key, img);
        }
      }
    }
  }, []);

  // Keyboard navigation & actions
  React.useEffect(() => {
    let walkTimer: NodeJS.Timeout | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      setIsWalking(true);
      if (walkTimer) clearTimeout(walkTimer);
      walkTimer = setTimeout(() => setIsWalking(false), 220);

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          onMovePlayer(0, -1, 'up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          onMovePlayer(0, 1, 'down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          onMovePlayer(-1, 0, 'left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          onMovePlayer(1, 0, 'right');
          break;

        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
          e.preventDefault();
          onSelectHotbar(Number(e.key) - 1);
          break;

        case ' ':
        case 'e':
        case 'E':
        case 'Enter':
          e.preventDefault();
          if (activeTool === 'remove') {
            onActionRemove();
          } else if (activeTool === 'water') {
            onActionWater();
          } else if (activeTool === 'move') {
            onActionMove();
          } else {
            onActionPlant();
          }
          break;

        case 'r':
        case 'R':
        case 'Backspace':
          e.preventDefault();
          onActionRemove();
          break;

        case 'm':
        case 'M':
          e.preventDefault();
          onActionMove();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (walkTimer) clearTimeout(walkTimer);
    };
  }, [
    onMovePlayer,
    onSelectHotbar,
    onActionPlant,
    onActionRemove,
    onActionWater,
    onActionMove,
    activeTool,
  ]);

  // Main 60FPS Game Loop Render Cycle (Particle effect completely removed!)
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let tick = 0;

    const render = () => {
      tick++;

      // Enforce crisp nearest-neighbor pixel rendering
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, totalWidth, totalHeight);

      const currentBiome = state.activeBiomeId || 'meadow';
      const currentSkin = state.activeSkinId || 'gardener_default';

      // 1. Draw Unified Garden Layout Map Image (Entire map in one cohesive image)
      const mapImg = mapImageCacheRef.current.get(currentBiome);
      if (mapImg && mapImg.complete && mapImg.naturalWidth > 0) {
        ctx.drawImage(mapImg, 0, 0, totalWidth, totalHeight);
      } else {
        // Fallback tile-by-tile rendering while map image loads
        const grassImg = tileImageCacheRef.current.get(`${currentBiome}_grass`);
        const pathImg = tileImageCacheRef.current.get(`${currentBiome}_path`);
        const waterImg = tileImageCacheRef.current.get(`${currentBiome}_water`);
        const fenceImg = tileImageCacheRef.current.get(`${currentBiome}_fence`);

        for (let r = 0; r < state.gridRows; r++) {
          for (let c = 0; c < state.gridCols; c++) {
            const px = c * TILE_SIZE;
            const py = r * TILE_SIZE;
            const seed = c * 31 + r * 17;

            // Perimeter Fence
            if (r === 0 || r === state.gridRows - 1 || c === 0 || c === state.gridCols - 1) {
              if (fenceImg && fenceImg.complete && fenceImg.naturalWidth > 0) {
                ctx.drawImage(fenceImg, px, py, TILE_SIZE, TILE_SIZE);
              } else {
                drawFenceTile(ctx, px, py, currentBiome);
              }
            }
            // Garden Cobblestone Pathway (horizontal row 5, vertical col 7 down to row 7)
            else if (r === 5 || (c === 7 && r <= 7)) {
              if (pathImg && pathImg.complete && pathImg.naturalWidth > 0) {
                ctx.drawImage(pathImg, px, py, TILE_SIZE, TILE_SIZE);
              } else {
                drawPathTile(ctx, px, py, seed, currentBiome);
              }
            }
            // Biome Ground Terrain
            else {
              if (grassImg && grassImg.complete && grassImg.naturalWidth > 0) {
                ctx.drawImage(grassImg, px, py, TILE_SIZE, TILE_SIZE);
              } else {
                drawGrassTile(ctx, px, py, seed, currentBiome);
              }
            }
          }
        }
      }

      // 2. Draw Moving Tree Target Halo if in relocate mode
      if (movingTreeFrom) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.strokeRect(
          movingTreeFrom.x * TILE_SIZE + 2,
          movingTreeFrom.y * TILE_SIZE + 2,
          TILE_SIZE - 4,
          TILE_SIZE - 4,
        );
      }

      // 3. Draw Selected / Hovered Tile Cursor Indicator
      if (hoveredTile) {
        const { x, y } = hoveredTile;
        const isHoverInBounds = x > 0 && x < state.gridCols - 1 && y > 0 && y < state.gridRows - 1;

        ctx.strokeStyle = isHoverInBounds ? '#7EBF52' : '#ef4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(x * TILE_SIZE + 2, y * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        ctx.setLineDash([]);

        // Ghost Tree Preview on hovered empty tile if plant tool is active
        const equippedSlug = state.hotbar[state.activeHotbarIndex];
        const isOccupied = state.plantedTrees.some((t) => t.x === x && t.y === y);
        if (activeTool === 'plant' && equippedSlug && isHoverInBounds && !isOccupied) {
          ctx.save();
          ctx.globalAlpha = 0.55;
          const img = treeImageCacheRef.current.get(equippedSlug);
          if (img && img.complete && img.naturalWidth > 0) {
            const drawSize = 64;
            const cx = x * TILE_SIZE + TILE_SIZE / 2;
            const bottomY = y * TILE_SIZE + TILE_SIZE;
            ctx.drawImage(img, cx - drawSize / 2, bottomY - drawSize, drawSize, drawSize);
          } else {
            drawTreeSprite(ctx, x * TILE_SIZE, y * TILE_SIZE, equippedSlug, 4, tick);
          }
          ctx.restore();
        }
      }

      // 4. Draw Tile in front of player (action target cursor)
      const { x: px, y: py, direction } = state.playerPos;
      let targetX = px;
      let targetY = py;
      if (direction === 'up') targetY -= 1;
      if (direction === 'down') targetY += 1;
      if (direction === 'left') targetX -= 1;
      if (direction === 'right') targetX += 1;

      if (targetX >= 0 && targetX < state.gridCols && targetY >= 0 && targetY < state.gridRows) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(
          targetX * TILE_SIZE + 4,
          targetY * TILE_SIZE + 4,
          TILE_SIZE - 8,
          TILE_SIZE - 8,
        );
      }

      // 5. Update Free-Roaming Companion Pets AI & Motion
      const activePetIds = state.activePetIds || ['dog'];
      const petSpeeds: Record<PetId, number> = {
        dog: 1.1,
        cat: 1.0,
        horse: 1.3,
        tiger: 1.25,
        peacock: 0.9,
        unicorn: 1.25,
        pegasus: 1.2,
      };

      // Add missing pets
      for (const petId of activePetIds) {
        if (!petsRef.current.has(petId)) {
          const startCol = 2 + Math.floor(Math.random() * (state.gridCols - 4));
          const startRow = 2 + Math.floor(Math.random() * (state.gridRows - 4));
          petsRef.current.set(petId, {
            id: petId,
            x: startCol * TILE_SIZE,
            y: startRow * TILE_SIZE,
            targetX: startCol * TILE_SIZE,
            targetY: startRow * TILE_SIZE,
            facing: Math.random() > 0.5 ? 'right' : 'left',
            state: 'idle',
            timer: 80 + Math.floor(Math.random() * 160),
            speed: petSpeeds[petId] || 1.1,
          });
        }
      }

      // Remove inactive pets
      for (const petId of Array.from(petsRef.current.keys())) {
        if (!activePetIds.includes(petId)) {
          petsRef.current.delete(petId);
        }
      }

      // Update AI & motion for each roaming pet
      for (const pet of Array.from(petsRef.current.values())) {
        if (pet.state === 'walking') {
          const dx = pet.targetX - pet.x;
          const dy = pet.targetY - pet.y;
          const dist = Math.hypot(dx, dy);

          if (dist <= pet.speed) {
            pet.x = pet.targetX;
            pet.y = pet.targetY;
            pet.state = 'idle';
            pet.timer = 180 + Math.floor(Math.random() * 240); // 3 to 7 seconds idle behavior
          } else {
            pet.x += (dx / dist) * pet.speed;
            pet.y += (dy / dist) * pet.speed;
            pet.facing = dx < 0 ? 'left' : 'right';
          }
        } else if (pet.state === 'idle') {
          pet.timer--;
          if (pet.timer <= 0) {
            const newCol = 1 + Math.floor(Math.random() * (state.gridCols - 2));
            const newRow = 1 + Math.floor(Math.random() * (state.gridRows - 2));
            const hasTree = state.plantedTrees.some((t) => t.x === newCol && t.y === newRow);
            if (!hasTree) {
              pet.targetX = newCol * TILE_SIZE;
              pet.targetY = newRow * TILE_SIZE;
              pet.state = 'walking';
              pet.facing = pet.targetX < pet.x ? 'left' : 'right';
            } else {
              pet.timer = 40;
            }
          }
        }
      }

      // 6. Draw Planted Trees, Player & Roaming Pets with Y-Sorting (Depth Buffering)
      const renderEntities: Array<
        | { type: 'tree'; y: number; tree: PlantedTree }
        | { type: 'player'; y: number }
        | { type: 'pet'; y: number; pet: ActivePetState }
      > = [
        ...state.plantedTrees.map((tree) => ({
          type: 'tree' as const,
          y: tree.y * TILE_SIZE + TILE_SIZE,
          tree,
        })),
        { type: 'player' as const, y: state.playerPos.y * TILE_SIZE + TILE_SIZE },
        ...Array.from(petsRef.current.values()).map((pet) => ({
          type: 'pet' as const,
          y: pet.y + TILE_SIZE,
          pet,
        })),
      ];

      renderEntities.sort((a, b) => a.y - b.y);

      for (const entity of renderEntities) {
        if (entity.type === 'player') {
          const charPx = state.playerPos.x * TILE_SIZE;
          const charPy = state.playerPos.y * TILE_SIZE;
          const cx = charPx + TILE_SIZE / 2;
          const bottomY = charPy + TILE_SIZE;

          // Multi-frame animation cadence calculation
          const dirKey =
            state.playerPos.direction === 'left' || state.playerPos.direction === 'right'
              ? 'side'
              : state.playerPos.direction;

          let frameIdx = 0;
          if (isWalking) {
            // 4-phase walking cycle: idle (0) -> left step (1) -> idle (0) -> right step (2)
            const cyclePhase = Math.floor((tick / 7) % 4);
            if (cyclePhase === 1) frameIdx = 1;
            else if (cyclePhase === 3) frameIdx = 2;
            else frameIdx = 0;
          }

          const spriteKey = `${currentSkin}_${dirKey}_${frameIdx}`;
          const charImg = characterImageCacheRef.current.get(spriteKey);

          // Player drop shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
          ctx.beginPath();
          ctx.ellipse(cx, bottomY - 3, 11, 4, 0, 0, Math.PI * 2);
          ctx.fill();

          if (charImg && charImg.complete && charImg.naturalWidth > 0) {
            ctx.save();
            const spriteSize = 48;
            ctx.translate(cx, bottomY - spriteSize / 2 - 2);

            // If walking left, flip the side profile horizontally!
            if (state.playerPos.direction === 'left') {
              ctx.scale(-1, 1);
            }

            ctx.drawImage(charImg, -spriteSize / 2, -spriteSize / 2, spriteSize, spriteSize);
            ctx.restore();
          } else {
            drawGardener(
              ctx,
              charPx,
              charPy,
              state.playerPos.direction,
              isWalking,
              tick,
              currentSkin,
            );
          }
        } else if (entity.type === 'tree') {
          const pt = entity.tree;
          const tileX = pt.x * TILE_SIZE;
          const tileY = pt.y * TILE_SIZE;
          const cx = tileX + TILE_SIZE / 2;
          const bottomY = tileY + TILE_SIZE;

          // Tree ground shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
          ctx.beginPath();
          ctx.ellipse(cx, bottomY - 3, 16, 5, 0, 0, Math.PI * 2);
          ctx.fill();

          // Gentle wind sway
          const sway = Math.sin((tick + pt.x * 5) / 26) * 1.5;

          const img = treeImageCacheRef.current.get(pt.treeSlug);
          if (img && img.complete && img.naturalWidth > 0) {
            let scale = 1.0;
            if (pt.growthStage === 1) scale = 0.4;
            else if (pt.growthStage === 2) scale = 0.6;
            else if (pt.growthStage === 3) scale = 0.85;
            else scale = 1.1;

            const drawW = 68 * scale;
            const drawH = 68 * scale;

            ctx.drawImage(img, cx - drawW / 2 + sway, bottomY - drawH + 2, drawW, drawH);
          } else {
            drawTreeSprite(ctx, tileX, tileY, pt.treeSlug, pt.growthStage, tick);
          }

          // Water droplet sparkle indicator if recently watered
          if (pt.wateredAt) {
            ctx.fillStyle = '#60a5fa';
            ctx.fillRect(cx - 3, bottomY - 6, 6, 2);
          }
        } else if (entity.type === 'pet' && entity.pet) {
          const pet = entity.pet;
          const cx = pet.x + TILE_SIZE / 2;
          const bottomY = pet.y + TILE_SIZE;

          // Pet ground shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.beginPath();
          ctx.ellipse(cx, bottomY - 3, 13, 4, 0, 0, Math.PI * 2);
          ctx.fill();

          // Determine animation frame
          let animKey = 'walk_0';
          if (pet.state === 'walking') {
            const step = Math.floor((tick / 7) % 3);
            animKey = `walk_${step}`;
          } else {
            // Special idle behavior cycle (idle_0 -> idle_1 -> idle_2)
            const phase = Math.floor((tick / 35) % 4);
            if (phase === 0) animKey = 'idle_0';
            else if (phase === 1 || phase === 3) animKey = 'idle_1';
            else animKey = 'idle_2';
          }

          const spriteKey = `${pet.id}_${animKey}`;
          const spriteImg = petImageCacheRef.current.get(spriteKey);

          if (spriteImg && spriteImg.complete && spriteImg.naturalWidth > 0) {
            ctx.save();
            ctx.translate(cx, bottomY - 24);

            // Flip horizontally if facing left
            if (pet.facing === 'left') {
              ctx.scale(-1, 1);
            }

            ctx.drawImage(spriteImg, -24, -24, 48, 48);
            ctx.restore();
          }
        }
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [state, hoveredTile, isWalking, movingTreeFrom, activeTool, totalWidth, totalHeight]);

  // Handle Mouse Hover for tile selection and tooltip
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const tileX = Math.floor(mouseX / TILE_SIZE);
    const tileY = Math.floor(mouseY / TILE_SIZE);

    if (tileX >= 0 && tileX < state.gridCols && tileY >= 0 && tileY < state.gridRows) {
      setHoveredTile({ x: tileX, y: tileY });
      const tree = state.plantedTrees.find((t) => t.x === tileX && t.y === tileY);
      setInspectedTree(tree || null);
    } else {
      setHoveredTile(null);
      setInspectedTree(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredTile(null);
    setInspectedTree(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const tileX = Math.floor(mouseX / TILE_SIZE);
    const tileY = Math.floor(mouseY / TILE_SIZE);

    if (tileX >= 0 && tileX < state.gridCols && tileY >= 0 && tileY < state.gridRows) {
      onTileClick(tileX, tileY);
    }
  };

  const inspectedTreeDef = inspectedTree ? getTreeBySlug(inspectedTree.treeSlug) : null;

  return (
    <div className="relative flex flex-col items-center justify-center select-none overflow-hidden rounded-2xl border-2 border-border/80 bg-card shadow-md p-2.5 sm:p-3 w-full">
      {/* Canvas Viewport */}
      <div className="relative overflow-auto max-w-full rounded-lg shadow-inner">
        <canvas
          ref={canvasRef}
          width={totalWidth}
          height={totalHeight}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="block cursor-pointer bg-emerald-950/20"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Hover Inspector Pill Popup */}
        {inspectedTree && inspectedTreeDef && (
          <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2.5 rounded-lg border border-border/80 bg-background/95 px-3 py-2 shadow-lg backdrop-blur-md animate-fade-in">
            <div className="size-7 rounded-sm overflow-hidden bg-primary/10 flex items-center justify-center p-0.5">
              <img
                src={`/trees/${inspectedTreeDef.slug}.png`}
                alt={inspectedTreeDef.name}
                className="size-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">{inspectedTreeDef.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-xs bg-muted text-muted-foreground uppercase font-bold">
                  {inspectedTreeDef.rarity.name}
                </span>
              </div>
              <p className="text-[11px] text-positive font-medium">
                Offsets {inspectedTreeDef.co2OffsetKgPerYear} kg CO₂/yr •{' '}
                {inspectedTree.growthStage === 4
                  ? '🌸 Mature Bloom'
                  : `Stage ${inspectedTree.growthStage}/4`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Controls Hint Bar */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between w-full px-2 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span>
            Move:{' '}
            <kbd className="rounded-xs bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">
              WASD
            </kbd>{' '}
            or{' '}
            <kbd className="rounded-xs bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">
              Arrows
            </kbd>
          </span>
          <span>
            Action:{' '}
            <kbd className="rounded-xs bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">
              Space
            </kbd>{' '}
            / Click
          </span>
          <span>
            Hotbar:{' '}
            <kbd className="rounded-xs bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">
              1-6
            </kbd>
          </span>
        </div>
        <div className="flex items-center gap-2 text-positive font-medium">
          <span className="size-2 rounded-full bg-positive animate-pulse" />
          <span>Interactive 2D Canvas</span>
        </div>
      </div>
    </div>
  );
}
