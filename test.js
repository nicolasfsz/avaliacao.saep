// test.js - Testes automatizados com Selenium para o Sistema SATE
// Execute com: node test.js

const { Builder, By, until, Key } = require('selenium-webdriver');
const assert = require('assert');

// Configurações
const BASE_URL ='file:///C:/Temp/nicolas/projetos/avaliacao.saep/index.html'; // ALTERE PARA O CAMINHO DO SEU ARQUIVO
const TIMEOUT = 10000;

// Função auxiliar para aguardar
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Função para criar driver
async function createDriver() {
    return await new Builder()
        .forBrowser('chrome')
        // .forBrowser('firefox') // Descomente para usar Firefox
        .build();
}

// Teste 1: Login e Início da Avaliação
async function testLogin() {
    console.log('\n=== Teste 1: Login e Início da Avaliação ===');
    const driver = await createDriver();
    
    try {
        await driver.get(BASE_URL);
        console.log('✓ Página carregada');
        
        // Verificar se está na tela de login
        const loginScreen = await driver.findElement(By.id('loginScreen'));
        const isDisplayed = await loginScreen.isDisplayed();
        assert.strictEqual(isDisplayed, true, 'Tela de login deve estar visível');
        console.log('✓ Tela de login visível');
        
        // Preencher nome do estudante
        const nameInput = await driver.findElement(By.id('studentName'));
        await nameInput.sendKeys('João da Silva');
        console.log('✓ Nome preenchido');
        
        // Clicar no botão de iniciar
        const loginBtn = await driver.findElement(By.css('.login-btn'));
        await loginBtn.click();
        console.log('✓ Botão de iniciar clicado');
        
        // Aguardar a tela de exame aparecer
        await driver.wait(until.elementLocated(By.id('examScreen')), TIMEOUT);
        const examScreen = await driver.findElement(By.id('examScreen'));
        const examDisplayed = await examScreen.isDisplayed();
        assert.strictEqual(examDisplayed, true, 'Tela de exame deve estar visível');
        console.log('✓ Tela de exame carregada');
        
        // Verificar se o nome do estudante aparece
        const studentInfo = await driver.findElement(By.id('studentInfo'));
        const infoText = await studentInfo.getText();
        assert.ok(infoText.includes('João da Silva'), 'Nome do estudante deve aparecer');
        console.log('✓ Nome do estudante exibido corretamente');
        
        console.log('✅ Teste de Login: PASSOU');
    } catch (error) {
        console.error('❌ Teste de Login: FALHOU');
        console.error(error.message);
    } finally {
        await driver.quit();
    }
}

// Teste 2: Responder Questões
async function testAnswerQuestions() {
    console.log('\n=== Teste 2: Responder Questões ===');
    const driver = await createDriver();
    
    try {
        await driver.get(BASE_URL);
        
        // Fazer login
        await driver.findElement(By.id('studentName')).sendKeys('Maria Santos');
        await driver.findElement(By.css('.login-btn')).click();
        await driver.wait(until.elementLocated(By.id('examScreen')), TIMEOUT);
        console.log('✓ Login realizado');
        
        // Verificar questão inicial
        const questionNumber = await driver.findElement(By.id('currentQuestionNumber'));
        let currentQ = await questionNumber.getText();
        assert.strictEqual(currentQ, '1', 'Deve começar na questão 1');
        console.log('✓ Questão 1 carregada');
        
        // Responder primeira questão (alternativa E)
        await driver.findElement(By.id('optione')).click();
        console.log('✓ Alternativa E selecionada');
        
        await sleep(500);
        
        // Verificar contadores atualizados
        const answeredCount = await driver.findElement(By.id('answeredCount'));
        const answered = await answeredCount.getText();
        assert.strictEqual(answered, '1', 'Contador de respondidas deve ser 1');
        console.log('✓ Contador atualizado: 1 questão respondida');
        
        // Ir para próxima questão
        await driver.findElement(By.id('nextBtn')).click();
        await sleep(500);
        
        currentQ = await questionNumber.getText();
        assert.strictEqual(currentQ, '2', 'Deve estar na questão 2');
        console.log('✓ Navegação para questão 2');
        
        // Responder questão 2 (alternativa B)
        await driver.findElement(By.id('optionb')).click();
        console.log('✓ Questão 2 respondida');
        
        await sleep(500);
        
        // Verificar novo contador
        const newAnswered = await answeredCount.getText();
        assert.strictEqual(newAnswered, '2', 'Contador deve ser 2');
        console.log('✓ Contador atualizado: 2 questões respondidas');
        
        console.log('✅ Teste de Responder Questões: PASSOU');
    } catch (error) {
        console.error('❌ Teste de Responder Questões: FALHOU');
        console.error(error.message);
    } finally {
        await driver.quit();
    }
}

// Teste 3: Navegação entre Questões
async function testNavigation() {
    console.log('\n=== Teste 3: Navegação entre Questões ===');
    const driver = await createDriver();
    
    try {
        await driver.get(BASE_URL);
        
        // Fazer login
        await driver.findElement(By.id('studentName')).sendKeys('Pedro Oliveira');
        await driver.findElement(By.css('.login-btn')).click();
        await driver.wait(until.elementLocated(By.id('examScreen')), TIMEOUT);
        console.log('✓ Login realizado');
        
        const questionNumber = await driver.findElement(By.id('currentQuestionNumber'));
        
        // Testar botão "Anterior" desabilitado na primeira questão
        const prevBtn = await driver.findElement(By.id('prevBtn'));
        const isPrevDisabled = await prevBtn.getAttribute('disabled');
        assert.ok(isPrevDisabled, 'Botão Anterior deve estar desabilitado na questão 1');
        console.log('✓ Botão Anterior desabilitado na questão 1');
        
        // Ir para questão 5 usando o grid
        const questionGrid = await driver.findElements(By.css('.question-number'));
        await questionGrid[4].click(); // Questão 5 (índice 4)
        await sleep(500);
        
        let currentQ = await questionNumber.getText();
        assert.strictEqual(currentQ, '5', 'Deve estar na questão 5');
        console.log('✓ Navegação via grid para questão 5');
        
        // Testar botão "Anterior"
        await driver.findElement(By.id('prevBtn')).click();
        await sleep(500);
        
        currentQ = await questionNumber.getText();
        assert.strictEqual(currentQ, '4', 'Deve voltar para questão 4');
        console.log('✓ Botão Anterior funcionando');
        
        // Testar botão "Próxima"
        await driver.findElement(By.id('nextBtn')).click();
        await sleep(500);
        
        currentQ = await questionNumber.getText();
        assert.strictEqual(currentQ, '5', 'Deve avançar para questão 5');
        console.log('✓ Botão Próxima funcionando');
        
        // Ir para última questão (40)
        const lastQuestion = await driver.findElements(By.css('.question-number'));
        await lastQuestion[39].click();
        await sleep(500);
        
        // Verificar se botão "Próxima" está desabilitado
        const nextBtn = await driver.findElement(By.id('nextBtn'));
        const isNextDisabled = await nextBtn.getAttribute('disabled');
        assert.ok(isNextDisabled, 'Botão Próxima deve estar desabilitado na questão 40');
        console.log('✓ Botão Próxima desabilitado na última questão');
        
        console.log('✅ Teste de Navegação: PASSOU');
    } catch (error) {
        console.error('❌ Teste de Navegação: FALHOU');
        console.error(error.message);
    } finally {
        await driver.quit();
    }
}

// Teste 4: Funcionalidade de Apagar Resposta
async function testClearAnswer() {
    console.log('\n=== Teste 4: Apagar Resposta ===');
    const driver = await createDriver();
    
    try {
        await driver.get(BASE_URL);
        
        // Fazer login
        await driver.findElement(By.id('studentName')).sendKeys('Ana Costa');
        await driver.findElement(By.css('.login-btn')).click();
        await driver.wait(until.elementLocated(By.id('examScreen')), TIMEOUT);
        console.log('✓ Login realizado');
        
        // Responder uma questão
        await driver.findElement(By.id('optiona')).click();
        await sleep(500);
        console.log('✓ Questão respondida');
        
        // Verificar que está marcada
        const radioA = await driver.findElement(By.id('optiona'));
        const isChecked = await radioA.isSelected();
        assert.strictEqual(isChecked, true, 'Alternativa A deve estar selecionada');
        console.log('✓ Resposta selecionada confirmada');
        
        // Verificar contador
        let answeredCount = await driver.findElement(By.id('answeredCount'));
        let answered = await answeredCount.getText();
        assert.strictEqual(answered, '1', 'Contador deve ser 1');
        
        // Clicar em "Apagar resposta"
        await driver.findElement(By.id('clearAnswerBtn')).click();
        await sleep(500);
        console.log('✓ Botão Apagar clicado');
        
        // Verificar que foi desmarcada
        const isStillChecked = await radioA.isSelected();
        assert.strictEqual(isStillChecked, false, 'Alternativa deve estar desmarcada');
        console.log('✓ Resposta apagada');
        
        // Verificar contador zerado
        answered = await answeredCount.getText();
        assert.strictEqual(answered, '0', 'Contador deve voltar para 0');
        console.log('✓ Contador atualizado para 0');
        
        console.log('✅ Teste de Apagar Resposta: PASSOU');
    } catch (error) {
        console.error('❌ Teste de Apagar Resposta: FALHOU');
        console.error(error.message);
    } finally {
        await driver.quit();
    }
}

// Teste 5: Timer
async function testTimer() {
    console.log('\n=== Teste 5: Timer ===');
    const driver = await createDriver();
    
    try {
        await driver.get(BASE_URL);
        
        // Fazer login
        await driver.findElement(By.id('studentName')).sendKeys('Carlos Mendes');
        await driver.findElement(By.css('.login-btn')).click();
        await driver.wait(until.elementLocated(By.id('examScreen')), TIMEOUT);
        console.log('✓ Login realizado');
        
        // Verificar timer inicial
        const timer = await driver.findElement(By.id('timer'));
        const initialTime = await timer.getText();
        assert.ok(initialTime.includes('2 h'), 'Timer deve começar em 2h');
        console.log(`✓ Timer inicial: ${initialTime}`);
        
        // Aguardar 3 segundos
        await sleep(3000);
        
        // Verificar se timer mudou
        const newTime = await timer.getText();
        assert.notStrictEqual(newTime, initialTime, 'Timer deve ter mudado');
        console.log(`✓ Timer atualizado: ${newTime}`);
        
        console.log('✅ Teste de Timer: PASSOU');
    } catch (error) {
        console.error('❌ Teste de Timer: FALHOU');
        console.error(error.message);
    } finally {
        await driver.quit();
    }
}

// Teste 6: Grid de Questões
async function testQuestionGrid() {
    console.log('\n=== Teste 6: Grid de Questões ===');
    const driver = await createDriver();
    
    try {
        await driver.get(BASE_URL);
        
        // Fazer login
        await driver.findElement(By.id('studentName')).sendKeys('Juliana Silva');
        await driver.findElement(By.css('.login-btn')).click();
        await driver.wait(until.elementLocated(By.id('examScreen')), TIMEOUT);
        console.log('✓ Login realizado');
        
        // Verificar quantidade de botões no grid
        const gridButtons = await driver.findElements(By.css('.question-number'));
        assert.strictEqual(gridButtons.length, 40, 'Deve haver 40 questões no grid');
        console.log('✓ 40 questões no grid');
        
        // Responder questão 1
        await driver.findElement(By.id('optione')).click();
        await sleep(500);
        
        // Verificar se questão 1 ficou marcada como respondida
        const button1 = gridButtons[0];
        const hasAnsweredClass = await button1.getAttribute('class');
        assert.ok(hasAnsweredClass.includes('answered'), 'Questão 1 deve ter classe answered');
        console.log('✓ Questão 1 marcada como respondida no grid');
        
        // Ir para questão 10
        await gridButtons[9].click();
        await sleep(500);
        
        // Verificar classe active
        const button10 = await driver.findElements(By.css('.question-number'));
        const activeClass = await button10[9].getAttribute('class');
        assert.ok(activeClass.includes('active'), 'Questão 10 deve ter classe active');
        console.log('✓ Questão 10 marcada como ativa no grid');
        
        console.log('✅ Teste de Grid de Questões: PASSOU');
    } catch (error) {
        console.error('❌ Teste de Grid de Questões: FALHOU');
        console.error(error.message);
    } finally {
        await driver.quit();
    }
}

// Teste 7: Finalizar Prova e Resultados
async function testFinishExam() {
    console.log('\n=== Teste 7: Finalizar Prova e Resultados ===');
    const driver = await createDriver();
    
    try {
        await driver.get(BASE_URL);
        
        // Fazer login
        await driver.findElement(By.id('studentName')).sendKeys('Roberto Alves');
        await driver.findElement(By.css('.login-btn')).click();
        await driver.wait(until.elementLocated(By.id('examScreen')), TIMEOUT);
        console.log('✓ Login realizado');
        
        // Responder 5 questões (3 certas, 2 erradas)
        // Q1: E (correta)
        await driver.findElement(By.id('optione')).click();
        await sleep(300);
        
        // Q2: B (correta)
        await driver.findElement(By.id('nextBtn')).click();
        await sleep(300);
        await driver.findElement(By.id('optionb')).click();
        await sleep(300);
        
        // Q3: B (correta)
        await driver.findElement(By.id('nextBtn')).click();
        await sleep(300);
        await driver.findElement(By.id('optionb')).click();
        await sleep(300);
        
        // Q4: A (errada, correta é B)
        await driver.findElement(By.id('nextBtn')).click();
        await sleep(300);
        await driver.findElement(By.id('optiona')).click();
        await sleep(300);
        
        // Q5: A (errada, correta é B)
        await driver.findElement(By.id('nextBtn')).click();
        await sleep(300);
        await driver.findElement(By.id('optiona')).click();
        await sleep(500);
        
        console.log('✓ 5 questões respondidas (3 certas, 2 erradas)');
        
        // Clicar em Finalizar
        await driver.findElement(By.id('finishBtn')).click();
        await sleep(500);
        
        // Aceitar confirmação (se houver)
        try {
            await driver.switchTo().alert().accept();
            console.log('✓ Confirmação aceita');
        } catch (e) {
            // Alert pode não aparecer em alguns navegadores
        }
        
        await sleep(1000);
        
        // Verificar se está na tela de resultados
        const resultsScreen = await driver.findElement(By.id('resultsScreen'));
        const isDisplayed = await resultsScreen.isDisplayed();
        assert.strictEqual(isDisplayed, true, 'Tela de resultados deve estar visível');
        console.log('✓ Tela de resultados visível');
        
        // Verificar pontuação
        const finalScore = await driver.findElement(By.id('finalScore'));
        const score = await finalScore.getText();
        assert.strictEqual(score, '3', 'Pontuação deve ser 3');
        console.log('✓ Pontuação correta: 3/40');
        
        // Verificar total de questões
        const totalQuestions = await driver.findElement(By.id('totalQuestions'));
        const total = await totalQuestions.getText();
        assert.strictEqual(total, '40', 'Total deve ser 40');
        console.log('✓ Total de questões: 40');
        
        // Verificar percentual
        const percentage = await driver.findElement(By.id('scorePercentage'));
        const percent = await percentage.getText();
        assert.ok(percent.includes('%'), 'Deve mostrar percentual');
        console.log(`✓ Percentual exibido: ${percent}`);
        
        // Verificar nome do estudante
        const studentName = await driver.findElement(By.id('finalStudentName'));
        const name = await studentName.getText();
        assert.strictEqual(name, 'Roberto Alves', 'Nome deve estar correto');
        console.log('✓ Nome do estudante nos resultados: Roberto Alves');
        
        // Verificar cards de resumo
        const correctCount = await driver.findElement(By.id('correctCount'));
        const correct = await correctCount.getText();
        assert.strictEqual(correct, '3', 'Corretas: 3');
        console.log('✓ Questões corretas: 3');
        
        const incorrectCount = await driver.findElement(By.id('incorrectCount'));
        const incorrect = await incorrectCount.getText();
        assert.strictEqual(incorrect, '2', 'Incorretas: 2');
        console.log('✓ Questões incorretas: 2');
        
        const blankCount = await driver.findElement(By.id('blankResultCount'));
        const blank = await blankCount.getText();
        assert.strictEqual(blank, '35', 'Em branco: 35');
        console.log('✓ Questões em branco: 35');
        
        console.log('✅ Teste de Finalizar Prova: PASSOU');
    } catch (error) {
        console.error('❌ Teste de Finalizar Prova: FALHOU');
        console.error(error.message);
    } finally {
        await driver.quit();
    }
}

// Teste 8: Validação de Formulário de Login
async function testLoginValidation() {
    console.log('\n=== Teste 8: Validação de Login ===');
    const driver = await createDriver();
    
    try {
        await driver.get(BASE_URL);
        
        // Tentar enviar formulário vazio
        const loginBtn = await driver.findElement(By.css('.login-btn'));
        await loginBtn.click();
        await sleep(500);
        
        // Verificar se ainda está na tela de login
        const loginScreen = await driver.findElement(By.id('loginScreen'));
        const isDisplayed = await loginScreen.isDisplayed();
        assert.strictEqual(isDisplayed, true, 'Deve permanecer na tela de login');
        console.log('✓ Validação do formulário funcionando');
        
        console.log('✅ Teste de Validação de Login: PASSOU');
    } catch (error) {
        console.error('❌ Teste de Validação de Login: FALHOU');
        console.error(error.message);
    } finally {
        await driver.quit();
    }
}

// Função principal para executar todos os testes
async function runAllTests() {
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║   TESTES AUTOMATIZADOS - SISTEMA SATE             ║');
    console.log('║   Sistema de Aplicação de Testes Eletrônicos      ║');
    console.log('╚════════════════════════════════════════════════════╝');
    
    const startTime = Date.now();
    
    await testLoginValidation();
    await testLogin();
    await testAnswerQuestions();
    await testNavigation();
    await testClearAnswer();
    await testTimer();
    await testQuestionGrid();
    await testFinishExam();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║              RESUMO DOS TESTES                     ║');
    console.log('╚════════════════════════════════════════════════════╝');
    console.log(`Tempo total de execução: ${duration}s`);
    console.log('\n✅ Todos os testes foram executados!');
    console.log('\nVerifique os resultados acima para ver se algum teste falhou.');
}

// Executar os testes
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = {
    testLogin,
    testAnswerQuestions,
    testNavigation,
    testClearAnswer,
    testTimer,
    testQuestionGrid,
    testFinishExam,
    testLoginValidation,
    runAllTests
};