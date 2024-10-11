import pactum from 'pactum'; // Importe os matchers
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';
import { faker } from '@faker-js/faker/.';

describe('QA Treinamentos', () => {
    const nomeMercado = faker.company.name();
    const p = pactum;
    const rep = SimpleReporter;
    const baseUrl = 'https://api-desafio-qa.onrender.com/mercado';

    let mercadoId;


    p.request.setDefaultTimeout(30000);

    beforeAll( async ()  => {
        p.reporter.add(rep)
        mercadoId = await p
            .spec()
            .post(`${baseUrl}`)
            .withJson({
                nome: nomeMercado,
                cnpj: '12345678910123',
                endereco: 'sao ludgero'
            })
            .expectStatus(StatusCodes.CREATED)
            .returns(r => r.res.body.novoMercado.id)           
        
    });
    

    afterAll( async () => {
        p.reporter.end()
        await p 
            .spec()
            .delete(`${baseUrl}/${mercadoId}`)
            .expectStatus(StatusCodes.OK)
            .expectBodyContains(
                `Mercado com ID ${mercadoId} foi removido com sucesso.`
            );
        });


    describe('Mercado', () => {
        
        
        it('Devera dar um erro por tentar cadastrar um mercado já cadastrado', async () => {
            await p
                .spec()
                .post(`${baseUrl}`)
                .withJson({
                    nome: nomeMercado,
                    cnpj: '12345678910123',
                    endereco: 'sao ludgero'
                })
                .expectStatus(StatusCodes.BAD_REQUEST)
                .expectBodyContains(
                    `O nome ${nomeMercado} já existe na lista de Mercados.`
                );
            });
            
        it('Devera retornar um erro por conta do cnpj ser menor que 14 digitos', async () => {
            await p
            .spec()
            .post(`${baseUrl}`)
            .withJson({
                nome: nomeMercado,
                cnpj: '123456789',
                endereco: 'sao ludgero'
            })
            .expectStatus(StatusCodes.BAD_REQUEST)
            .expectBodyContains(
                'CNPJ deve ter 14 dígitos',
            );
        });
            
        it('Deverá testar se possui algum mercado cadastrado', async () => {
            await p
                .spec()
                .get(`${baseUrl}`)
                .expectStatus(StatusCodes.OK);
        });
        
        it('Deverá retornar o mercado cadastro acima', async () => {
            await p
                .spec()
                .get(`${baseUrl}/${mercadoId}`)
                .expectStatus(StatusCodes.OK)
        });

        it('Devera alterar o mercado cadastrado', async () => {
            await p
                .spec()
                .put(`${baseUrl}/${mercadoId}`)
                .withJson({
                    nome: nomeMercado,
                    cnpj: '12345678910123',
                    endereco: 'São Ludgero'
                })
                .expectStatus(StatusCodes.OK)
                .expectBodyContains(
                    'Mercado atualizado com sucesso'
                );
        });
        
        it('Devera retornar um erro por conta dos dados de entrada invalidos', async () => {
            await p
                .spec()
                .put(`${baseUrl}/${mercadoId}`)
                .withJson({
                    nome: nomeMercado,
                    cnpj: '123456789',
                    endereco: 'sao ludgero'
                })
                .expectStatus(StatusCodes.BAD_REQUEST)
                .expectBodyContains(
                    'Dados de entrada inválidos'
                );
        });
        
        it('Devera dar erro ao encontrar o mercado', async () => {
            await p
                .spec()
                .put(`${baseUrl}/0`)
                .withJson({
                    nome: nomeMercado,
                    cnpj: '123456789',
                    endereco: 'sao ludgero'
                })
                .expectStatus(StatusCodes.NOT_FOUND)
        });

        it('Deverá cadastrar uma fruta no hortifruit', async () => {
            await p
                .spec()
                .post(`${baseUrl}/${mercadoId}/produtos`)
                .withJson({
                    nome: 'Banana',
                    valor: 3,
                })
                .expectStatus(StatusCodes.CREATED);
        });
        
        it('Deverá dar erro ao cadastrar uma fruta por ser não ser um valor inteiro', async () => {
            await p
                .spec()
                .post(`${baseUrl}/${mercadoId}/produtos`)
                .withJson({
                    nome: 'Maça',
                    valor: 5.5,
                })
                .expectStatus(StatusCodes.BAD_REQUEST)
                .expectBodyContains(
                    'Valor deve ser um número inteiro e não negativo'
                );
        });

        it('Deverá retornar as frutas cadastradas no hortifruit do mercado cadastrado', async () => {
            await p
                .spec()
                .get(`${baseUrl}/${mercadoId}/produtos/hortifruit/frutas`)
                .expectStatus(StatusCodes.OK);
        });

        it('Deverá cadastrar um legume no hortifruit', async () => {
            await p
                .spec()
                .post(`${baseUrl}/${mercadoId}/produtos/hortifruit/legumes`)
                .withJson({
                    nome: 'Pimentão',
                    valor: 5,
                })
                .expectStatus(StatusCodes.CREATED);
        });

        it('Deverá retornar todos os legumes cadastrados', async () => {
            await p
                .spec()
                .get(`${baseUrl}/${mercadoId}/produtos/hortifruit/legumes`)
                .expectStatus(StatusCodes.OK);
        });
        
        it('Deverá cadastrar um salgado na padaria', async () => {
            await p
                .spec()
                .post(`${baseUrl}/${mercadoId}/produtos/padaria/salgados`)
                .withJson({
                    nome: 'Coxinha',
                    valor: 8,
                })
                .expectStatus(StatusCodes.CREATED);
        });

        it('Deverá retornar todos os salgados cadastrados', async () => {
            await p
                .spec()
                .get(`${baseUrl}/${mercadoId}/produtos/padaria/salgados`)
                .expectStatus(StatusCodes.OK);
        });
        
        it('Deverá excluir um mercado', async () => {
            await p 
                .spec()
                .delete(`${baseUrl}/0`)
                .expectStatus(StatusCodes.NOT_FOUND);
        });

    });
});
