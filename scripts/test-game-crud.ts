import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../src/firebase/auth';
import { db } from '../src/firebase/firestore';
import { GameService } from '../src/services/gameService';

async function getOrAuthenticateTestUser() {
  const testEmail = 'realmor_test_runner@realmor.rpg';
  const testPassword = 'RealmorTestPassword123!';

  try {
    const cred = await signInWithEmailAndPassword(auth, testEmail, testPassword);
    return cred.user.uid;
  } catch (err: any) {
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      try {
        const cred = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
        await setDoc(doc(db, 'users', cred.user.uid), {
          uid: cred.user.uid,
          name: 'Realmor Test Runner',
          email: testEmail,
          role: 'master',
          plan: 'free',
          onboardingCompleted: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        return cred.user.uid;
      } catch (createErr) {
        const cred = await signInWithEmailAndPassword(auth, testEmail, testPassword);
        return cred.user.uid;
      }
    }
    throw err;
  }
}

async function runGameCrudTests() {
  console.log('===============================================================');
  console.log('--- [INICIANDO TESTES DO NOVO SISTEMA DE JOGOS REALMOR] ---');
  console.log('===============================================================');
  
  // 1. Autenticação
  console.log('\n[TESTE 1] Autenticando usuário de teste com Firebase...');
  const testUserId = await getOrAuthenticateTestUser();
  console.log(`✓ Autenticado com sucesso. UID: ${testUserId}`);

  const testCampaignId = `test_campaign_${Date.now()}`;
  const campaignRef = doc(db, 'campaigns', testCampaignId);

  console.log(`\n[TESTE 2] Criando campanha de teste no Firestore (${testCampaignId})...`);
  await setDoc(campaignRef, {
    id: testCampaignId,
    name: 'Crônicas de Arton - Campanha Principal',
    system: 'Tormenta 20',
    masterId: testUserId,
    playerIds: [],
    status: { state: 'active', isFavorite: false },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  console.log('✓ Campanha criada no Firestore.');

  let createdGameId = '';
  let generatedInviteCode = '';

  try {
    // 3. TESTE: Criar Jogo com valor padrão de 5 jogadores
    console.log('\n[TESTE 3] Criando jogo (GameService.createGame) com valor padrão de 5 jogadores...');
    const newGame = await GameService.createGame(testCampaignId, testUserId, {
      name: 'A Queda do Dragão Vermelho',
      description: 'Uma expedição heróica às minas profundas de Doherimm.',
      system: 'Tormenta 20',
      maxPlayers: 5,
      coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800'
    });

    createdGameId = newGame.id;
    generatedInviteCode = newGame.inviteCode;

    console.log(`✓ Jogo forjado com sucesso!`);
    console.log(`  - ID: ${createdGameId}`);
    console.log(`  - Nome: ${newGame.name}`);
    console.log(`  - Sistema: ${newGame.system}`);
    console.log(`  - Status inicial: ${newGame.status} (● LOBBY)`);
    console.log(`  - Convite: ${generatedInviteCode}`);
    console.log(`  - Capacidade: 👥 ${newGame.maxPlayers} jogadores`);

    if (newGame.maxPlayers !== 5) {
      throw new Error(`Esperado 5 jogadores por padrão, recebido ${newGame.maxPlayers}`);
    }

    // 4. TESTE: Visualizar na Lista pertencente somente àquela campanha
    console.log('\n[TESTE 4] Visualizando jogos da campanha (GameService.getCampaignGames)...');
    const campaignGames = await GameService.getCampaignGames(testCampaignId);
    console.log(`✓ Quantidade de jogos retornados para a campanha: ${campaignGames.length}`);
    const foundInList = campaignGames.find(g => g.id === createdGameId);
    if (!foundInList) {
      throw new Error('O jogo recém-criado não foi retornado na lista da campanha!');
    }
    console.log(`✓ Jogo "${foundInList.name}" verificado na lista com status "${foundInList.status}".`);

    // 5. TESTE: Atualizar dados (Nome, Descrição, Sistema, Máx de Jogadores, Status)
    console.log('\n[TESTE 5] Atualizando dados do jogo (GameService.updateGame)...');
    await GameService.updateGame(testCampaignId, createdGameId, {
      name: 'A Queda do Dragão Vermelho - Capítulo II',
      description: 'A cinza dos dragões agora cobre a montanha sagrada.',
      system: 'Tormenta 20',
      maxPlayers: 6
    });
    await GameService.updateGameStatus(testCampaignId, createdGameId, 'active');
    console.log('✓ Atualização submetida ao Firestore.');

    // 6. TESTE: Fechar e Reabrir (Confirmar persistência no Firestore)
    console.log('\n[TESTE 6] Simulando fechar e reabrir (consulta fresca no Firestore)...');
    const freshGameDoc = await getDoc(doc(db, 'campaigns', testCampaignId, 'games', createdGameId));
    if (!freshGameDoc.exists()) {
      throw new Error('Falha de persistência: documento do jogo não foi encontrado no Firestore!');
    }
    const freshData = freshGameDoc.data();
    console.log(`✓ Dados reabertos e verificados do Firestore:`);
    console.log(`  - Nome: "${freshData.name}" (esperado Capítulo II)`);
    console.log(`  - Descrição: "${freshData.description}"`);
    console.log(`  - Máximo de jogadores: ${freshData.maxPlayers}`);
    console.log(`  - Status: ${freshData.status} (● ATIVO)`);

    if (freshData.name !== 'A Queda do Dragão Vermelho - Capítulo II') {
      throw new Error('Nome do jogo não persistiu corretamente no Firestore.');
    }
    if (freshData.status !== 'active') {
      throw new Error('Status atualizado não persistiu no Firestore.');
    }

    // 7. TESTE: Excluir Jogo
    console.log('\n[TESTE 7] Testando exclusão da mesa (GameService.deleteGame)...');
    await GameService.deleteGame(testCampaignId, createdGameId);
    const postDeleteCheck = await getDoc(doc(db, 'campaigns', testCampaignId, 'games', createdGameId));
    if (postDeleteCheck.exists()) {
      throw new Error('Jogo ainda existe após chamada de deleteGame!');
    }
    console.log('✓ Jogo excluído com sucesso do Firestore (confirmado).');

    console.log('\n===============================================================');
    console.log('✅ TODOS OS TESTES FORAM EXECUTADOS E APROVADOS COM SUCESSO!');
    console.log('===============================================================');

  } finally {
    console.log('\n[LIMPEZA] Removendo campanha de teste temporária...');
    try {
      await deleteDoc(campaignRef);
      console.log('✓ Campanha de teste limpa.');
    } catch (cleanErr) {
      console.warn('Nota de limpeza:', cleanErr);
    }
  }
}

runGameCrudTests()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ ERRO NA EXECUÇÃO DOS TESTES:', err);
    process.exit(1);
  });
