document.addEventListener('DOMContentLoaded', function () {
    const partidosData = {
        'PDT': ['Flavinho', 'Diego', 'Lulu', 'Juninho', 'Luiz', 'Madalena', 'Adirlene', 'Gladston', 'Camila de Tereza', 'Tcheco', 'Legenda'],
        'Avante': ['Marlon', 'Diego Diretor', 'Marcinho', 'Kaike', 'Sandra de Brandão', 'Sanger', 'Edinho', 'Flavio Assistente Social', 'Tulinha', 'Diana', 'Legenda'],
        'PSB': ['Sasa', 'Lurdinha', 'Eunice', 'Maria Luiza', 'Rafael Eletricista', 'Ricardo de Paulo de João Pio', 'Fagner', 'Waxley', 'Bruno do Bamba', 'Nego', 'Legenda'],
        'PT+PV': ['Vaninha do Bar', 'Casio', 'Kito', 'Júlio dos Fernandes', 'Beto das Pacas', 'Mauro do São José', 'Vaninha', 'Rosa', 'Evaldo', 'Letícia', 'Legenda'],
        'PRD': ['Felipe Silveira', 'Tarcisio de Messias', 'Sheila Psicologa', 'Legenda'],
        'PP': ['Fabinho', 'Fabiano', 'Lobão', 'Preta Branca', 'Eleidiane', 'Legenda'],
        'Solidariedade': ['Vinícius Diretor', 'Neuzinha de Tatão', 'Legenda']
    };

    const votosCandidatos = {};
    const totalVagas = 9;

    function montarPartidos() {
        const containerPartidos = document.getElementById('partidos');
        containerPartidos.innerHTML = ''; // Limpar o conteúdo para atualização
        const order = ['PDT', 'Avante', 'PSB', 'PT+PV', 'PP', 'PRD', 'Solidariedade']; // Ordem personalizada

        order.forEach(partido => {
            if (partidosData[partido]) {
                const divPartido = document.createElement('div');
                divPartido.className = 'partido';
                divPartido.setAttribute('data-partido', partido);
                divPartido.ondragover = allowDrop;
                divPartido.ondrop = drop;

                const h3 = document.createElement('h3');
                h3.textContent = partido;
                divPartido.appendChild(h3);

                partidosData[partido].forEach(candidato => {
                    const div = document.createElement('div');
                    div.className = 'candidato';
                    div.draggable = true;
                    div.ondragstart = drag;
                    div.id = `${partido}_${candidato.replace(/\s+/g, '')}`;
                    div.setAttribute('data-candidato', candidato);
                    div.setAttribute('data-partido', partido);
                    div.innerHTML = `<label>${candidato}: <input type='number' min='0' value='0'></label>`;
                    divPartido.appendChild(div);

                    if (!votosCandidatos[partido]) votosCandidatos[partido] = {};
                    votosCandidatos[partido][candidato] = 0;
                });

                containerPartidos.appendChild(divPartido);
            }
        });
    }

    function allowDrop(ev) {
        ev.preventDefault();
    }

    function drag(ev) {
        ev.dataTransfer.setData("text", ev.target.id);
    }

    function drop(ev) {
        ev.preventDefault();
        const candidatoId = ev.dataTransfer.getData("text");
        const candidatoElement = document.getElementById(candidatoId);
        const novoPartido = ev.target.closest('.partido').getAttribute('data-partido');

        // Atualiza o partido do candidato no DOM
        candidatoElement.setAttribute('data-partido', novoPartido);
        candidatoElement.id = `${novoPartido}_${candidatoElement.getAttribute('data-candidato').replace(/\s+/g, '')}`;

        // Adiciona o candidato ao novo partido
        ev.target.closest('.partido').appendChild(candidatoElement);

        // Atualiza o objeto de dados
        atualizarPartidosData();
    }

    function atualizarPartidosData() {
        Object.keys(partidosData).forEach(partido => partidosData[partido] = []);
        document.querySelectorAll('.candidato').forEach(candidatoElement => {
            const partido = candidatoElement.getAttribute('data-partido');
            const candidato = candidatoElement.getAttribute('data-candidato');
            partidosData[partido].push(candidato);
        });
    }

    // Função para calcular os resultados da eleição
    function calcularResultados() {
        let totalVotosValidos = 0;
        const votos = {};

        Object.keys(partidosData).forEach(partido => {
            votos[partido] = 0;
            partidosData[partido].forEach(candidato => {
                const inputId = `${partido}_${candidato.replace(/\s+/g, '')}`;
                const votosCandidato = parseInt(document.getElementById(inputId).querySelector('input').value, 10);
                votosCandidatos[partido][candidato] = votosCandidato;
                votos[partido] += votosCandidato;
            });
            totalVotosValidos += votos[partido];
        });

        const quocienteEleitoral = totalVotosValidos / totalVagas;
        const cadeiras = {};
        let cadeirasRestantes = totalVagas;

        for (let partido in votos) {
            cadeiras[partido] = Math.floor(votos[partido] / quocienteEleitoral);
            cadeirasRestantes -= cadeiras[partido];
        }

        while (cadeirasRestantes > 0) {
            let partidoParaReceberCadeira = Object.keys(votos).reduce((a, b) =>
                (votos[a] / (cadeiras[a] + 1)) > (votos[b] / (cadeiras[b] + 1)) ? a : b
            );
            cadeiras[partidoParaReceberCadeira]++;
            cadeirasRestantes--;
        }

        const eleitos = {};
        Object.keys(cadeiras).forEach(partido => {
            let candidatosOrdenados = Object.entries(votosCandidatos[partido])
                .sort((a, b) => b[1] - a[1])
                .map(pair => pair[0])
                .filter(candidato => candidato !== 'Legenda');

            eleitos[partido] = candidatosOrdenados.slice(0, cadeiras[partido]);
        });

        const resultadosDiv = document.getElementById('resultados');
        resultadosDiv.innerHTML = `=== RESULTADOS DA ELEIÇÃO ===<br>Total de votos válidos: ${totalVotosValidos}<br><br>--- Votos por Partido ---<br>`;
        Object.keys(votos).forEach(partido => {
            resultadosDiv.innerHTML += `${partido}: ${votos[partido]} votos<br>`;
        });
        resultadosDiv.innerHTML += `<br>--- Distribuição de Cadeiras por Partido ---<br>`;
        Object.keys(cadeiras).forEach(partido => {
            resultadosDiv.innerHTML += `${partido}: ${cadeiras[partido]} cadeiras<br>`;
        });
        resultadosDiv.innerHTML += `<br>--- Candidatos Eleitos ---<br>`;
        Object.keys(eleitos).forEach(partido => {
            eleitos[partido].forEach(candidato => {
                resultadosDiv.innerHTML += `${partido} - ${candidato}<br>`;
            });
        });
    }

    // Função para zerar a votação
    function zerarVotacao() {
        Object.keys(partidosData).forEach(partido => {
            partidosData[partido].forEach(candidato => {
                const inputId = `${partido}_${candidato.replace(/\s+/g, '')}`;
                document.getElementById(inputId).querySelector('input').value = 0;
            });
        });
        document.getElementById('resultados').innerHTML = '';
    }

    // Adicionar ouvintes de eventos
    montarPartidos();
    document.querySelector('button[onclick="calcularResultados()"]').addEventListener('click', calcularResultados);
    document.querySelector('button[onclick="zerarVotacao()"]').addEventListener('click', zerarVotacao);
});
