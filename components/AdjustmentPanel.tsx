/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { trackUserAction } from '../telemetry';
import { RemoveBgIcon } from './icons';

interface AdjustmentPanelProps {
  onApplyAdjustment: (prompt: string) => void;
  isLoading: boolean;
}

const AdjustmentPanel: React.FC<AdjustmentPanelProps> = ({ onApplyAdjustment, isLoading }) => {
  const [selectedPresetPrompt, setSelectedPresetPrompt] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [vignetteStrength, setVignetteStrength] = useState(0);

  const presets = [
    { name: 'Blur Background', prompt: 'Apply a realistic depth-of-field effect, making the background blurry while keeping the main subject in sharp focus.' },
    { name: 'Enhance Details', prompt: 'Slightly enhance the sharpness and details of the image without making it look unnatural.' },
    { name: 'Warmer Lighting', prompt: 'Adjust the color temperature to give the image warmer, golden-hour style lighting.' },
    { name: 'Studio Light', prompt: 'Add dramatic, professional studio lighting to the main subject.' },
  ];

  const canApply = !!(selectedPresetPrompt || customPrompt.trim() || vignetteStrength > 0);

  const handlePresetClick = (prompt: string) => {
    setSelectedPresetPrompt(prompt);
    setCustomPrompt('');
    setVignetteStrength(0);
    trackUserAction('adjustment_preset_selected', { preset: prompt.slice(0,40) });
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomPrompt(e.target.value);
    setSelectedPresetPrompt(null);
    setVignetteStrength(0);
    trackUserAction('adjustment_custom_changed', { length: e.target.value.length });
  };
  
  const handleVignetteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setVignetteStrength(value);
    setSelectedPresetPrompt(null);
    setCustomPrompt('');
    trackUserAction('adjustment_vignette_changed', { value });
  };

  const handleApply = () => {
    let finalPrompt = selectedPresetPrompt || customPrompt;

    if (vignetteStrength > 0) {
        const intensity = vignetteStrength > 66 ? 'strong' : vignetteStrength > 33 ? 'medium' : 'subtle';
        finalPrompt = `Apply a photorealistic ${intensity} black vignette effect to the image, darkening the edges. The effect intensity should be approximately ${vignetteStrength}%.`;
    }

    if (finalPrompt) {
      onApplyAdjustment(finalPrompt);
      trackUserAction('adjustment_apply_clicked', { vignette: vignetteStrength, usedPreset: !!selectedPresetPrompt });
    }
  };
  
  const handleRemoveBackground = () => {
    onApplyAdjustment('Remove the background from the image, leaving only the main subject with a transparent background.');
    trackUserAction('adjustment_remove_background');
  };

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col gap-4 animate-fade-in backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-center text-gray-300">Apply a Professional Adjustment</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {presets.map(preset => (
          <button
            key={preset.name}
            onClick={() => handlePresetClick(preset.prompt)}
            disabled={isLoading}
            className={`w-full text-center bg-white/10 border border-transparent text-gray-200 font-semibold py-3 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/20 active:scale-95 text-base disabled:opacity-50 disabled:cursor-not-allowed ${selectedPresetPrompt === preset.prompt ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-blue-500' : ''}`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      <input
        type="text"
        value={customPrompt}
        onChange={handleCustomChange}
        placeholder="Or describe an adjustment (e.g., 'change background to a forest')"
        className="flex-grow bg-gray-800 border border-gray-600 text-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-base"
        disabled={isLoading}
      />

      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-gray-600"></div>
        <span className="flex-shrink mx-4 text-gray-400 text-sm">Or use a one-click tool</span>
        <div className="flex-grow border-t border-gray-600"></div>
      </div>
        
      <button
        onClick={handleRemoveBackground}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 text-center bg-gradient-to-br from-purple-600 to-indigo-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-purple-800 disabled:to-indigo-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
      >
        <RemoveBgIcon className="w-6 h-6" />
        Remove Background
      </button>

      <div className="flex flex-col gap-2 pt-4">
        <div className="flex justify-between items-center">
            <label htmlFor="vignette-slider" className="font-medium text-gray-300">Vignette Effect</label>
            <span className="text-sm text-gray-400 w-12 text-right">{vignetteStrength}%</span>
        </div>
        <input
            id="vignette-slider"
            type="range"
            min="0"
            max="100"
            value={vignetteStrength}
            onChange={handleVignetteChange}
            disabled={isLoading}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Vignette effect strength"
        />
      </div>

      {canApply && (
        <div className="animate-fade-in flex flex-col gap-4 pt-2">
            <button
                onClick={handleApply}
                className="w-full bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-blue-800 disabled:to-blue-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
                disabled={isLoading || !canApply}
            >
                Apply Adjustment
            </button>
        </div>
      )}
    </div>
  );
};

export default AdjustmentPanel;