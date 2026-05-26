'use client';

import { useState, useEffect } from 'react';
import { conferenciaService } from '@/services/conferenciaService';
import { conselhoService } from '@/services/conselhoService';
import type { Conselho } from '@/types';

export default function CriarConferencia() {
  const [nome, setNome] = useState('');
  const [conselhoParticularId, setConselhoParticularId] = useState('');
  const [conselhos, setConselhos] = useState<Conselho[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    carregarConselhos();
  }, []);

  const carregarConselhos = async () => {
    try {
      const dados = await conselhoService.listar();
      setConselhos(dados);
    } catch (err) {
      setError('Erro ao carregar conselhos');
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!nome.trim()) {
      setError('Nome da conferência é obrigatório');
      return;
    }

    if (!conselhoParticularId) {
      setError('Selecione um conselho');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nome,
        conselhoParticularId,
      };

      console.log('Payload enviado:', payload); // ← Debug

      const resultado = await conferenciaService.criar(payload);

      console.log('Conferência criada:', resultado); // ← Debug

      setSuccess(`Conferência "${nome}" criada com sucesso!`);
      setNome('');
      setConselhoParticularId('');
    } catch (err) {
      console.error('Erro ao criar conferência:', err);
      setError('Erro ao criar conferência. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Criar Conferência</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
            Nome da Conferência
          </label>
          <input
            id="nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500"
            placeholder="Digite o nome da conferência"
          />
        </div>

        <div>
          <label htmlFor="conselho" className="block text-sm font-medium text-gray-700">
            Conselho
          </label>
          <select
            id="conselho"
            value={conselhoParticularId}
            onChange={(e) => {
              console.log('Conselho selecionado:', e.target.value); // ← Debug
              setConselhoParticularId(e.target.value);
            }}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500"
          >
            <option value="">Selecione um conselho</option>
            {conselhos.map((conselho) => (
              <option key={conselho.id} value={conselho.id}>
                {conselho.nome}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Criando...' : 'Criar Conferência'}
        </button>
      </form>
    </div>
  );
}
