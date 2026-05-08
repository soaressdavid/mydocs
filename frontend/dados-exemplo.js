// =============================================
// USUÁRIOS MOCK (baseado no seed.js do backend)
// =============================================
const usuariosMock = [
  {
    id: "uuid-admin-001",
    ra: "1234567",
    nome: "Admin Sistema",
    email: "admin@eniac.edu.br",
    senha: "admin123", // Em produção, isso seria hash
    tipo: "admin",
    cargo: "Administrador",
    departamento: "TI",
    foto: null
  },
  {
    id: "uuid-gestor-001",
    ra: "2021001",
    nome: "João Silva",
    email: "joao@eniac.edu.br",
    senha: "senha123",
    tipo: "gestor",
    cargo: "Gerente de TI",
    departamento: "Tecnologia",
    foto: null
  },
  {
    id: "uuid-colaborador-001",
    ra: "2022001",
    nome: "Ana Costa",
    email: "ana@eniac.edu.br",
    senha: "senha123",
    tipo: "colaborador",
    cargo: "Desenvolvedora",
    departamento: "TI",
    foto: null
  },
  {
    id: "uuid-gestor-002",
    ra: "2021002",
    nome: "Maria Santos",
    email: "maria@eniac.edu.br",
    senha: "senha123",
    tipo: "gestor",
    cargo: "Gerente de RH",
    departamento: "Recursos Humanos",
    foto: null
  },
  {
    id: "uuid-colaborador-002",
    ra: "2022002",
    nome: "Carlos Oliveira",
    email: "carlos@eniac.edu.br",
    senha: "senha123",
    tipo: "colaborador",
    cargo: "Analista",
    departamento: "TI",
    foto: null
  }
];

// Compatibilidade com código antigo (sem RA e senha)
const contatosExemplo = usuariosMock.map(u => ({
  id: u.id,
  nome: u.nome,
  email: u.email,
  tipo: u.tipo,
  departamento: u.departamento,
  cargo: u.cargo,
  foto: u.foto
}));

// Salvar contatos
localStorage.setItem('contatos', JSON.stringify(contatosExemplo));

// Salvar usuários completos (com senha) para login mock
localStorage.setItem('usuariosMock', JSON.stringify(usuariosMock));

// Adicionar algumas avaliações tradicionais de exemplo
const avaliacoesExemplo = [
  {
    id: 3001,
    tipo: "gestor",
    avaliado: "João Silva",
    criterios: {
      pontualidade: 5,
      comunicacao: 4,
      tecnico: 5,
      proatividade: 4,
      equipe: 5
    },
    media: 4.6,
    comentario: "Excelente gestor, muito dedicado.",
    data: "26/04/2026"
  },
  {
    id: 3002,
    tipo: "colaborador",
    avaliado: "Ana Costa",
    criterios: {},
    media: null,
    comentario: "Colaboradora muito dedicada e pontual. Demonstra grande interesse em aprender e sempre busca feedback para melhorar. Sua comunicação é clara e ela se integra bem com a equipe.",
    data: "26/04/2026",
    tipoAvaliacao: "comentario"
  }
];

// Salvar avaliações tradicionais
localStorage.setItem('avaliacoes', JSON.stringify(avaliacoesExemplo));

// Adicionar algumas avaliações Nine Box de exemplo
const nineBoxExemplo = [
  {
    id: 2001,
    pessoaId: 1001,
    tipo: "gestor",
    pessoa: "João Silva",
    performance: 3,
    potential: 2,
    comentario: "Excelente gestor, muito dedicado à equipe.",
    data: "27/04/2026",
    categoria: "Especialista"
  },
  {
    id: 2002,
    pessoaId: 1003,
    tipo: "colaborador",
    pessoa: "Ana Costa",
    performance: 2,
    potential: 3,
    comentario: "Demonstra muito potencial, está sempre buscando aprender mais.",
    data: "27/04/2026",
    categoria: "Estrela"
  },
  {
    id: 2003,
    pessoaId: 1002,
    tipo: "gestor",
    pessoa: "Maria Santos",
    performance: 3,
    potential: 3,
    comentario: "Gestora excepcional com grande potencial de liderança.",
    data: "27/04/2026",
    categoria: "Superstar"
  }
];

// Salvar avaliações Nine Box
localStorage.setItem('nineBoxAvaliacoes', JSON.stringify(nineBoxExemplo));

console.log("Dados de exemplo adicionados com sucesso!");
console.log("Contatos:", contatosExemplo.length);
console.log("Avaliações tradicionais:", avaliacoesExemplo.length);
console.log("Avaliações Nine Box:", nineBoxExemplo.length);
console.log("\n=== CREDENCIAIS DE TESTE ===");
console.log("Admin: admin@eniac.edu.br / admin123");
console.log("Gestor: joao@eniac.edu.br / senha123");
console.log("Colaborador: ana@eniac.edu.br / senha123");