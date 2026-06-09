// frontend/src/components/common/SkillInput.jsx
// Tag-style skill input — press Enter or comma to add a skill

import { useState } from 'react';
import { FiX } from 'react-icons/fi';

const SkillInput = ({ skills = [], onChange, placeholder = 'Add a skill...' }) => {
  const [input, setInput] = useState('');

  const addSkill = () => {
    const skill = input.trim();
    // Don't add empty or duplicate skills
    if (!skill || skills.includes(skill)) {
      setInput('');
      return;
    }
    onChange([...skills, skill]);
    setInput('');
  };

  const removeSkill = (skillToRemove) => {
    onChange(skills.filter(s => s !== skillToRemove));
  };

  const handleKeyDown = (e) => {
    // Add skill on Enter or comma
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    }
    // Remove last skill on Backspace if input is empty
    if (e.key === 'Backspace' && !input && skills.length > 0) {
      onChange(skills.slice(0, -1));
    }
  };

  return (
    <div className="input-field flex flex-wrap gap-2 cursor-text min-h-[48px]"
         onClick={() => document.getElementById('skill-input').focus()}>
      {/* Skill pills */}
      {skills.map(skill => (
        <span key={skill}
          className="flex items-center gap-1 px-2.5 py-1 bg-ink-900
                     text-cyan-400 rounded-lg text-xs font-medium">
          {skill}
          <button
            type="button"
            onClick={() => removeSkill(skill)}
            className="hover:text-red-400 transition-colors"
          >
            <FiX size={10} />
          </button>
        </span>
      ))}

      {/* Input */}
      <input
        id="skill-input"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addSkill}
        placeholder={skills.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] bg-transparent outline-none
                   text-gray-900 placeholder-gray-400 text-sm"
      />
    </div>
  );
};

export default SkillInput;