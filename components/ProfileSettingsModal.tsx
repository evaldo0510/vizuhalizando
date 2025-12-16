
import React from 'react';
import { Modal } from './Modal';
import { Sliders, Save } from 'lucide-react';
import type { UserPreferences } from '../types';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onSave: (prefs: UserPreferences) => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  preferences, 
  onSave 
}) => {
  const [localPrefs, setLocalPrefs] = React.useState<UserPreferences>(preferences);

  React.useEffect(() => {
    setLocalPrefs(preferences);
  }, [preferences, isOpen]);

  const handleSave = () => {
    onSave(localPrefs);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Perfil & Preferências"
      icon={Sliders}
      sizeClass="max-w-xl"
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
            Estilos Favoritos
          </label>
          <input 
            type="text"
            placeholder="Ex: Minimalista, Boho, Clássico, Streetwear..."
            value={localPrefs.favoriteStyles.join(', ')}
            onChange={(e) => setLocalPrefs({
                ...localPrefs, 
                favoriteStyles: e.target.value.split(',').map(s => s.trim())
            })}
            className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-vizu-gold outline-none"
          />
          <p className="text-xs text-slate-500 mt-1">Separe por vírgulas.</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
            Cores Preferidas
          </label>
          <input 
            type="text"
            placeholder="Ex: Tons pastéis, Preto, Azul Marinho..."
            value={localPrefs.favoriteColors}
            onChange={(e) => setLocalPrefs({...localPrefs, favoriteColors: e.target.value})}
            className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-vizu-gold outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
            O que evitar? (Restrições)
          </label>
          <textarea 
            placeholder="Ex: Saltos muito altos, decotes profundos, cor amarela..."
            value={localPrefs.avoidItems}
            onChange={(e) => setLocalPrefs({...localPrefs, avoidItems: e.target.value})}
            className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-vizu-gold outline-none h-24 resize-none"
          />
        </div>

        <div className="pt-4">
            <button 
                onClick={handleSave}
                className="w-full py-3 bg-vizu-gold text-white font-bold rounded-xl shadow-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
            >
                <Save className="w-4 h-4" />
                Salvar Preferências
            </button>
        </div>
      </div>
    </Modal>
  );
};
