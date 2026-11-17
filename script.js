
// ======================================
// AGROSMART - SISTEMA PRINCIPAL
// ======================================

// 1. CARREGAMENTO DOS DADOS

let plantacoes = JSON.parse(
    localStorage.getItem("agrosmart_plantacoes") || "[]"
);

let irrigacoes = JSON.parse(
    localStorage.getItem("agrosmart_irrigacoes") || "[]"
);


// 2. FUNÇÃO PARA SALVAR DADOS

function salvarDados() {

    localStorage.setItem(
        "agrosmart_plantacoes",
        JSON.stringify(plantacoes)
    );

    localStorage.setItem(
        "agrosmart_irrigacoes",
        JSON.stringify(irrigacoes)
    );

}


// 3. PROTEÇÃO DOS TEXTOS EXIBIDOS

function escaparHTML(valor) {

    return String(valor).replace(/[&<>"']/g, function(caractere) {

        const entidades = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entidades[caractere];

    });

}


// 4. SISTEMA DE NAVEGAÇÃO

const botoesMenu = document.querySelectorAll(".menu-btn");

const paginas = document.querySelectorAll(".page");

botoesMenu.forEach(function(botao) {

    botao.addEventListener("click", function() {

        const destino = botao.dataset.page;

        paginas.forEach(function(pagina) {
            pagina.classList.remove("active");
        });

        botoesMenu.forEach(function(item) {
            item.classList.remove("active");
        });

        document.getElementById(destino).classList.add("active");

        botao.classList.add("active");

    });

});


// 5. CADASTRO DE PLANTAÇÕES

const formPlantacao = document.getElementById("formPlantacao");

formPlantacao.addEventListener("submit", function(event) {

    event.preventDefault();

    const cultura = document.getElementById("nomeCultura").value;

    const area = Number(document.getElementById("areaPlantada").value);

    const data = document.getElementById("dataPlantio").value;

    if (!cultura || !Number.isFinite(area) || area <= 0 || !data) {
        alert("Preencha os campos corretamente.");
        return;
    }

    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);

    if (new Date(data + "T12:00:00") > hoje) {
        alert("A data do plantio não pode ser futura.");
        return;
    }

    const novaPlantacao = {
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        cultura: cultura,
        area: area,
        data: data
    };

    plantacoes.push(novaPlantacao);

    salvarDados();

    formPlantacao.reset();

    atualizarAplicativo();

    alert("Plantação cadastrada com sucesso!");

});


// 6. MOSTRAR PLANTAÇÕES

function mostrarPlantacoes() {

    const lista = document.getElementById("listaPlantacoes");

    if (plantacoes.length === 0) {

        lista.innerHTML = "<p>Nenhuma plantação cadastrada.</p>";

        return;

    }

    lista.innerHTML = "";

    plantacoes.forEach(function(item) {

        const card = document.createElement("div");

        card.className = "item-card";

        card.innerHTML = `
            <h3>🌱 ${escaparHTML(item.cultura)}</h3>

            <p><strong>Área:</strong> ${item.area} m²</p>

            <p><strong>Data do plantio:</strong> ${escaparHTML(item.data)}</p>

            <button
                class="delete-btn"
                data-id="${escaparHTML(item.id)}"
            >
                Excluir plantação
            </button>
        `;

        card.querySelector(".delete-btn").addEventListener("click", function() {
            excluirPlantacao(item.id);
        });

        lista.appendChild(card);

    });

}


// 7. EXCLUIR PLANTAÇÃO

function excluirPlantacao(id) {

    const possuiIrrigacoes = irrigacoes.some(function(item) {
        return item.plantacaoId === id;
    });

    if (possuiIrrigacoes) {
        alert("Esta plantação possui registros de irrigação. Exclua esses registros primeiro.");
        return;
    }

    if (!confirm("Deseja realmente excluir esta plantação?")) {
        return;
    }

    plantacoes = plantacoes.filter(function(item) {
        return item.id !== id;
    });

    salvarDados();

    atualizarAplicativo();

}


// 8. ATUALIZAR OPÇÕES DE IRRIGAÇÃO

function atualizarOpcoesIrrigacao() {

    const select = document.getElementById("culturaIrrigada");

    select.innerHTML = '<option value="">Selecione uma plantação</option>';

    plantacoes.forEach(function(item) {

        const option = document.createElement("option");

        option.value = item.id;

        option.textContent = item.cultura + " - " + item.area + " m²";

        select.appendChild(option);

    });

}


// 9. REGISTRAR IRRIGAÇÃO

const formIrrigacao = document.getElementById("formIrrigacao");

formIrrigacao.addEventListener("submit", function(event) {

    event.preventDefault();

    const plantacaoId = document.getElementById("culturaIrrigada").value;

    const quantidade = Number(document.getElementById("quantidadeAgua").value);

    const data = document.getElementById("dataIrrigacao").value;

    const observacao = document.getElementById("observacaoIrrigacao").value;

    const plantacaoExiste = plantacoes.some(function(item) {
        return item.id === plantacaoId;
    });

    if (!plantacaoExiste || !Number.isFinite(quantidade) || quantidade <= 0 || !data) {
        alert("Preencha os campos corretamente e selecione uma plantação.");
        return;
    }

    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);

    if (new Date(data + "T12:00:00") > hoje) {
        alert("A data da irrigação não pode ser futura.");
        return;
    }

    const novaIrrigacao = {

        id: Date.now().toString() + Math.random().toString(16).slice(2),

        plantacaoId: plantacaoId,

        quantidade: quantidade,

        data: data,

        observacao: observacao

    };

    irrigacoes.push(novaIrrigacao);

    salvarDados();

    formIrrigacao.reset();

    atualizarAplicativo();

    alert("Irrigação registrada com sucesso!");

});


// 10. MOSTRAR HISTÓRICO DE IRRIGAÇÕES

function mostrarIrrigacoes() {

    const lista = document.getElementById("listaIrrigacoes");

    if (irrigacoes.length === 0) {

        lista.innerHTML = "<p>Nenhuma irrigação registrada.</p>";

        return;

    }

    lista.innerHTML = "";

    irrigacoes.forEach(function(item) {

        const cultura = plantacoes.find(function(p) {
            return p.id === item.plantacaoId;
        });

        const card = document.createElement("div");

        card.className = "item-card";

        card.innerHTML = `

            <h3>💧 ${escaparHTML(cultura ? cultura.cultura : "Cultura")}</h3>

            <p><strong>Água utilizada:</strong> ${item.quantidade} litros</p>

            <p><strong>Data:</strong> ${escaparHTML(item.data)}</p>

            <p><strong>Observações:</strong> ${escaparHTML(item.observacao || "Nenhuma")}</p>

            <button class="delete-btn">
                Excluir registro
            </button>

        `;

        card.querySelector(".delete-btn").addEventListener("click", function() {
            excluirIrrigacao(item.id);
        });

        lista.appendChild(card);

    });

}


// 11. EXCLUIR IRRIGAÇÃO

function excluirIrrigacao(id) {

    if (!confirm("Deseja excluir este registro?")) {
        return;
    }

    irrigacoes = irrigacoes.filter(function(item) {
        return item.id !== id;
    });

    salvarDados();

    atualizarAplicativo();

}


// 12. ATUALIZAR PAINEL PRINCIPAL

function atualizarPainel() {

    document.getElementById("totalPlantacoes").textContent =
        plantacoes.length;

    document.getElementById("totalIrrigacoes").textContent =
        irrigacoes.length;

    document.getElementById("culturaPrincipal").textContent =
        plantacoes.length > 0
            ? plantacoes[plantacoes.length - 1].cultura
            : "Nenhuma";

}


// 13. ATUALIZAR RELATÓRIOS

function atualizarRelatorios() {

    const totalAgua = irrigacoes.reduce(function(total, item) {

        return total + item.quantidade;

    }, 0);

    document.getElementById("relatorioPlantacoes").textContent =
        plantacoes.length;

    document.getElementById("relatorioIrrigacoes").textContent =
        irrigacoes.length;

    document.getElementById("totalAgua").textContent =
        totalAgua.toLocaleString("pt-BR") + " litros";

}


// 14. EXPORTAR RELATÓRIO CSV

function exportarRelatorio() {

    let linhas = [
        ["Tipo", "Cultura", "Área (m²)", "Quantidade de água (litros)", "Data", "Observações"]
    ];

    plantacoes.forEach(function(item) {

        linhas.push([
            "Plantação",
            item.cultura,
            item.area,
            "",
            item.data,
            ""
        ]);

    });

    irrigacoes.forEach(function(item) {

        const cultura = plantacoes.find(function(p) {
            return p.id === item.plantacaoId;
        });

        linhas.push([
            "Irrigação",
            cultura ? cultura.cultura : "Cultura",
            "",
            item.quantidade,
            item.data,
            item.observacao
        ]);

    });

    const csv = "\uFEFF" + linhas.map(function(linha) {

        return linha.map(function(valor) {

            return '"' + String(valor).replace(/"/g, '""') + '"';

        }).join(";");

    }).join("\n");

    const arquivo = new Blob(
        [csv],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(arquivo);

    const link = document.createElement("a");

    link.href = url;

    link.download = "relatorio-agrosmart.csv";

    link.click();

    URL.revokeObjectURL(url);

}


// 15. ATUALIZAR TODO O APLICATIVO

function atualizarAplicativo() {

    mostrarPlantacoes();

    mostrarIrrigacoes();

    atualizarOpcoesIrrigacao();

    atualizarPainel();

    atualizarRelatorios();

}


// 16. INICIALIZAÇÃO

atualizarAplicativo();

console.log("AgroSmart iniciado com sucesso!");

