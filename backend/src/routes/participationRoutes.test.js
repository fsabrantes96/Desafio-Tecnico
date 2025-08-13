

const request = require('supertest');
const app = require('../../src/app'); 
const { pool } = require('../../src/config/database'); 


jest.mock('../../src/config/database', () => ({
  pool: {
    query: jest.fn(), 
  },
  initializeDatabase: jest.fn().mockResolvedValue(true), 
}));


describe('Testes para as Rotas de Participação', () => {

  
  afterEach(() => {
    jest.clearAllMocks();
  });

  
  describe('POST /api/participations', () => {
    
    
    it('deve criar um novo participante e retornar status 201', async () => {
      const novoParticipante = {
        id: 1,
        firstname: 'João',
        lastname: 'Silva',
        participation: 50,
      };

      
      pool.query.mockResolvedValue({ rows: [novoParticipante] });

      const response = await request(app)
        .post('/api/participations')
        .send({ firstName: 'João', lastName: 'Silva', participation: 50 });

      
      expect(response.statusCode).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.firstname).toBe('João');
    });

    it('deve retornar erro 400 se faltar o campo firstName', async () => {
      const response = await request(app)
        .post('/api/participations')
        .send({ lastName: 'Silva', participation: 50 });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe('Todos os campos são obrigatórios.');
    });

    it('deve retornar erro 400 se a participação for negativa', async () => {
      const response = await request(app)
        .post('/api/participations')
        .send({ firstName: 'Maria', lastName: 'Souza', participation: -10 });

      
      
      
      
      expect(response.statusCode).toBe(400);
      expect(response.body.error).toContain('número positivo');
    });
  });
});
