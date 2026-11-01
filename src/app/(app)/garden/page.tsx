'use client';

import * as React from 'react';
import { GardenCanvas } from '@/components/blocks/garden/garden-canvas';
import { GardenHeader } from '@/components/blocks/garden/garden-header';
import { GardenHotbar } from '@/components/blocks/garden/garden-hotbar';
import { GardenInventoryDialog } from '@/components/blocks/garden/garden-inventory-dialog';
import { TreeRewardDialog } from '@/components/blocks/garden/tree-reward-dialog';
import { Card } from '@/components/ui/card';
import { useGarden } from '@/hooks/use-garden';
import type { Tree } from '@/types/trees';

export default function GardenPage() {
  const {
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
  } = useGarden();

  const [activeTool, setActiveTool] = React.useState<'plant' | 'water' | 'remove' | 'move'>(
    'plant',
  );
  const [inventoryOpen, setInventoryOpen] = React.useState(false);
  const [rewardTree, setRewardTree] = React.useState<Tree | null>(null);

  // Click on a garden tile
  const handleTileClick = (x: number, y: number) => {
    if (movingTreeFrom) {
      toggleMoveTree(x, y);
      return;
    }

    if (activeTool === 'remove') {
      removeTree(x, y);
    } else if (activeTool === 'water') {
      waterTree(x, y);
    } else if (activeTool === 'move') {
      toggleMoveTree(x, y);
    } else {
      plantTree(x, y);
    }
  };

  // Keyboard / D-pad Space action
  const handleActionPlant = () => {
    const facing = getFacingTile();
    plantTree(facing.x, facing.y);
  };

  const handleActionRemove = () => {
    const facing = getFacingTile();
    removeTree(facing.x, facing.y);
  };

  const handleActionWater = () => {
    const facing = getFacingTile();
    waterTree(facing.x, facing.y);
  };

  const handleActionMove = () => {
    const facing = getFacingTile();
    toggleMoveTree(facing.x, facing.y);
  };

  // Mobile Action Button
  const handleMainActionButton = () => {
    if (activeTool === 'remove') {
      handleActionRemove();
    } else if (activeTool === 'water') {
      handleActionWater();
    } else if (activeTool === 'move') {
      handleActionMove();
    } else {
      handleActionPlant();
    }
  };

  const handleClaimReward = () => {
    const awarded = claimReward();
    setRewardTree(awarded);
  };

  const handlePlantNowFromInventory = (treeSlug: string) => {
    const facing = getFacingTile();
    plantTree(facing.x, facing.y, treeSlug);
  };

  if (!isLoaded) {
    return (
      <div className="space-y-6 animate-pulse">
        <Card className="p-6 h-32" />
        <Card className="h-[480px] w-full" />
        <Card className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Garden Header & Metrics */}
      <GardenHeader state={state} onClaimRewardSeed={handleClaimReward} />

      {/* 2D Pixel Art Canvas Viewport */}
      <GardenCanvas
        state={state}
        movingTreeFrom={movingTreeFrom}
        onTileClick={handleTileClick}
        onMovePlayer={movePlayer}
        onActionPlant={handleActionPlant}
        onActionRemove={handleActionRemove}
        onActionWater={handleActionWater}
        onActionMove={handleActionMove}
        onSelectHotbar={setActiveHotbarIndex}
        activeTool={activeTool}
      />

      {/* Hotbar & Mobile Controls */}
      <GardenHotbar
        state={state}
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        onSelectHotbarIndex={setActiveHotbarIndex}
        onOpenInventory={() => setInventoryOpen(true)}
        onMovePlayer={movePlayer}
        onActionButton={handleMainActionButton}
      />

      {/* Backpack & Nursery Dialog */}
      <GardenInventoryDialog
        open={inventoryOpen}
        onClose={() => setInventoryOpen(false)}
        state={state}
        onAssignToHotbar={assignToHotbar}
        onPlantNow={handlePlantNowFromInventory}
      />

      {/* Reward Seed Unlocked Dialog */}
      <TreeRewardDialog
        tree={rewardTree}
        open={Boolean(rewardTree)}
        onClose={() => setRewardTree(null)}
        onPlantNow={handlePlantNowFromInventory}
      />
    </div>
  );
}
