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
import type { GardenState, PlantedTree } from '@/types/trees';

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

    // 3. Biome tilesets (16 tiles)
    const biomes = ['meadow', 'zen_bamboo', 'autumn_orchard', 'sacred_grove'];
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

      // 1. Draw Image Terrain Grid (Background)
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
          // Garden Cobblestone Pathway: horizontal path on row 5 and vertical path on col 7
          else if (r === 5 || (c === 7 && r < 7)) {
            if (pathImg && pathImg.complete && pathImg.naturalWidth > 0) {
              ctx.drawImage(pathImg, px, py, TILE_SIZE, TILE_SIZE);
            } else {
              drawPathTile(ctx, px, py, seed, currentBiome);
            }
          }
          // Garden Pond at (7, 7) and (8, 7)
          else if ((c === 7 || c === 8) && (r === 7 || r === 8)) {
            if (waterImg && waterImg.complete && waterImg.naturalWidth > 0) {
              ctx.drawImage(waterImg, px, py, TILE_SIZE, TILE_SIZE);
            } else {
              drawWaterTile(ctx, px, py, tick, c === 7 && r === 7, currentBiome);
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
        const isHoverInBounds =
          x > 0 &&
          x < state.gridCols - 1 &&
          y > 0 &&
          y < state.gridRows - 1 &&
          !((x === 7 || x === 8) && (y === 7 || y === 8));

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

      // 5. Draw Planted Trees & Player with Y-Sorting (Depth Buffering)
      const renderEntities: Array<{
        type: 'tree' | 'player';
        y: number;
        tree?: PlantedTree;
      }> = [
        ...state.plantedTrees.map((tree) => ({ type: 'tree' as const, y: tree.y, tree })),
        { type: 'player' as const, y: state.playerPos.y },
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

            ctx.drawImage(
              charImg,
              -spriteSize / 2,
              -spriteSize / 2,
              spriteSize,
              spriteSize,
            );
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
        } else if (entity.tree) {
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

            ctx.drawImage(
              img,
              cx - drawW / 2 + sway,
              bottomY - drawH + 2,
              drawW,
              drawH,
            );
          } else {
            drawTreeSprite(ctx, tileX, tileY, pt.treeSlug, pt.growthStage, tick);
          }

          // Water droplet sparkle indicator if recently watered
          if (pt.wateredAt) {
            ctx.fillStyle = '#60a5fa';
            ctx.fillRect(cx - 3, bottomY - 6, 6, 2);
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
    <div className="relative flex flex-col items-center justify-center select-none overflow-hidden rounded-xl border-2 border-border bg-card shadow-md p-2">
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
          <div
            className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2.5 rounded-lg border border-border/80 bg-background/95 px-3 py-2 shadow-lg backdrop-blur-md animate-fade-in"
          >
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
                <span className="text-xs font-bold text-foreground">
                  {inspectedTreeDef.name}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-xs bg-muted text-muted-foreground uppercase font-bold">
                  {inspectedTreeDef.rarity.name}
                </span>
              </div>
              <p className="text-[11px] text-positive font-medium">
                Offsets {inspectedTreeDef.co2OffsetKgPerYear} kg CO₂/yr •{' '}
                {inspectedTree.growthStage === 4 ? '🌸 Mature Bloom' : `Stage ${inspectedTree.growthStage}/4`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Controls Hint Bar */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between w-full px-2 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span>
            Move: <kbd className="rounded-xs bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">WASD</kbd> or <kbd className="rounded-xs bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">Arrows</kbd>
          </span>
          <span>
            Action: <kbd className="rounded-xs bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">Space</kbd> / Click
          </span>
          <span>
            Hotbar: <kbd className="rounded-xs bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">1-6</kbd>
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
