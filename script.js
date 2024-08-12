document.addEventListener('DOMContentLoaded', function () {
    const partidosData = {
        'PDT': ['Flavinho', 'Diego', 'Lulu', 'Juninho', 'Luiz', 'Madalena', 'Adirlene', 'Gladston', 'Camila de Tereza', 'Tcheco', 'Legenda'],
        'Avante': ['Marlon', 'Diego Diretor', 'Marcinho', 'Kaike', 'Sandra de Brandão', 'Sanger', 'Edinho', 'Flavio Assistente Social', 'Tulinha', 'Diana', 'Legenda'],
        'PSB': ['Sasa', 'Lurdinha', 'Eunice', 'Maria Luiza', 'Rafael Eletricista', 'Ricardo de Paulo de João Pio', 'Fagner', 'Waxley', 'Bruno do Bamba', 'Nego', 'Legenda'],
        'PT+PV': ['Vaninha do Bar', 'Casio', 'Kito', 'Júlio dos Fernandes', 'Beto das Pacas', 'Mauro do São José', 'Vaninha', 'Rosa', 'Evaldo', 'Letícia', 'Legenda'],
        'PRD': ['Felipe Silveira', 'Zé Olinto', 'Tarcisio de Messias', 'Adilson Passa 10', 'Sheila Psicologa', 'Leda Maria', 'Legenda'],
        'PP': ['Fabinho', 'Fabiano', 'Lobão', 'Preta Branca', 'Eleidiane', 'Legenda']
    };

    Object.keys(partidosData).forEach(partido => {
        partidosData[partido] = partidosData[partido].sort().filter(c => c !== 'Legenda').concat('Legenda');
    });

    const votosCandidatos = {};
    const totalVagas = 9;

    function montarPartidos() {
        const containerPartidos = document.getElementById('partidos');
        Object.keys(partidosData).forEach(partido => {
            const divPartido = document.createElement('div');
            divPartido.className = 'partido';
            const h3 = document.createElement('h3');
            h3.textContent = partido;
            divPartido.appendChild(h3);

            partidosData[partido].forEach(candidato => {
                const div = document.createElement('div');
                const inputId = `${partido}_${candidato.replace(/\s+/g, '')}`;
                div.innerHTML = `<label>${candidato}: <input type='number' id='${inputId}' min='0' value='0'></label>`;
                divPartido.appendChild(div);
                if (!votosCandidatos[partido]) votosCandidatos[partido] = {};
                votosCandidatos[partido][candidato] = 0;
            });

            containerPartidos.appendChild(divPartido);
        });
    }

    function calcularResultados() {
        let totalVotosValidos = 0;
        const votos = {};

        Object.keys(partidosData).forEach(partido => {
            votos[partido] = 0;
            partidosData[partido].forEach(candidato => {
                const inputId = `${partido}_${candidato.replace(/\s+/g, '')}`;
                const votosCandidato = parseInt(document.getElementById(inputId).value, 10);
                votos[partido] += votosCandidato;
                votosCandidatos[partido][candidato] = votosCandidato;
            });
            // Filtra a Legenda antes de calcular o total de votos válidos
            if (votosCandidatos[partido]['Legenda'] >= Math.max(...Object.values(votosCandidatos[partido]))) {
                votos[partido] -= votosCandidatos[partido]['Legenda'];
            }
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
                                            .map(pair => pair[0]);
            
            // Remove a Legenda se necessário antes de determinar os eleitos
            candidatosOrdenados = candidatosOrdenados.filter(candidato => candidato !== 'Legenda');

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

    montarPartidos();
    document.querySelector('button').addEventListener('click', calcularResultados);
});
