import React from 'react';

const TestSimple = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🚀 Teste Simples</h1>
      <p>Se você está vendo isto, o React está funcionando!</p>
      
      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Status dos Serviços</h2>
        
        <div style={{ marginBottom: '10px' }}>
          <strong>Frontend:</strong> ✅ Funcionando (você está vendo esta página)
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <strong>Data/Hora:</strong> {new Date().toLocaleString()}
        </div>
        
        <button 
          onClick={() => alert('React onClick funcionando!')}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Testar Interação
        </button>
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>Se chegou até aqui, o problema não é com o React básico.</p>
        <p>Verifique o console (F12) para erros específicos.</p>
      </div>
    </div>
  );
};

export default TestSimple; 