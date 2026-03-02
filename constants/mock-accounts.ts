export type UserType = 'profissional' | 'paciente';

export type MockAccount = {
  name: string;
  email: string;
  password: string;
  type: UserType;
};

export const MOCK_ACCOUNTS: MockAccount[] = [
  {
    name: 'Dr. Carlos Mendes',
    email: 'profissional@teste.com',
    password: '123456',
    type: 'profissional',
  },
  {
    name: 'Ana Souza',
    email: 'paciente@teste.com',
    password: '123456',
    type: 'paciente',
  },
];
