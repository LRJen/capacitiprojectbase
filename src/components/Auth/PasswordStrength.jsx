import React from 'react';

const PasswordStrengthBar = ({ password }) => {
  const strength = getStrength(password);

  const getGradient = (level) => {
    const gradients = [
      'linear-gradient(to right, #ccc, #ccc)',              // 0 - Empty
      'linear-gradient(to right, #ff6666, #ff9999)',        // 1 - Weak
      'linear-gradient(to right, #ff9966, #ffcc66)',        // 2 - Fair
      'linear-gradient(to right, #ffcc66, #ccff66)',        // 3 - Good
      'linear-gradient(to right, #66cc66, #00cc66)'         // 4 - Strong
    ];
    return gradients[level];
  };

  const getLabel = (level) => {
    const labels = ['Too Short', 'Weak', 'Fair', 'Good', 'Strong'];
    return labels[level];
  };

  const getLabelColor = (level) => {
    const colors = ['#cfcfcf', '#ff8484', '#ffb647', '#dada3b', '#3fc03f'];
    return colors[level];
  };

  return (
    <div className="password-strength-wrapper">
      <div className="password-strength-bar">
        <div
          style={{
            width: `${(strength / 4) * 100}%`,
            height: '0.5rem',
            background: getGradient(strength),
            borderRadius: '0.25rem',
            transition: 'width 0.3s ease, background 0.3s ease',
          }}
        ></div>
      </div>
      <div
        className="password-strength-label"
        style={{ color: getLabelColor(strength) }}
      >
        {getLabel(strength)}
      </div>
    </div>
  );
};

const getStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*]/.test(password)) score++;
  return score;
};

export default PasswordStrengthBar;
