
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


// 2. SALVAR DADOS

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


// 3. PROTEGER TEXTOS

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


// 4. NAVEGAÇÃO

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


// 5. CADASTRAR PLANTAÇÃO

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
            <button class="delete-btn">
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
            <button class="delete-btn">Excluir registro</button>
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


// 13. CRIAR ESPAÇO DOS GRÁFICOS

function prepararGraficos() {
    const pagina = document.getElementById("relatorios");

    if (!pagina || document.getElementById("graficosAgroSmart")) {
        return;
    }

    const areaGraficos = document.createElement("div");
    areaGraficos.id = "graficosAgroSmart";
    areaGraficos.className = "charts-grid";

    areaGraficos.innerHTML = `
        <div class="chart-card">
            <h3>🌱 Plantações por cultura</h3>
            <p>Quantidade de plantações cadastradas.</p>
            <div id="graficoPlantacoes"></div>
        </div>

        <div class="chart-card">
            <h3>💧 Consumo de água</h3>
            <p>Água utilizada em cada cultura.</p>
            <div id="graficoAgua"></div>
        </div>

        <div class="chart-card">
            <h3>📐 Área plantada</h3>
            <p>Área cadastrada por cultura, em m².</p>
            <div id="graficoArea"></div>
        </div>
    `;

    const botaoExportar = pagina.querySelector(
        'button[onclick="exportarRelatorio()"]'
    );

    if (botaoExportar) {
        pagina.insertBefore(areaGraficos, botaoExportar);
    } else {
        pagina.appendChild(areaGraficos);
    }
}


// 14. AGRUPAR DADOS POR CULTURA

function agruparPorCultura(tipo) {
    const resultado = {};

    plantacoes.forEach(function(plantacao) {
        const nome = plantacao.cultura;

        if (!resultado[nome]) {
            resultado[nome] = 0;
        }

        if (tipo === "quantidade") {
            resultado[nome] += 1;
        }

        if (tipo === "area") {
            resultado[nome] += Number(plantacao.area) || 0;
        }
    });

    if (tipo === "agua") {
        irrigacoes.forEach(function(irrigacao) {
            const plantacao = plantacoes.find(function(item) {
                return item.id === irrigacao.plantacaoId;
            });

            if (plantacao) {
                const nome = plantacao.cultura;

                if (!resultado[nome]) {
                    resultado[nome] = 0;
                }

                resultado[nome] += Number(irrigacao.quantidade) || 0;
            }
        });
    }

    return resultado;
}


// 15. DESENHAR GRÁFICO DE BARRAS

function desenharGrafico(elementoId, dados, unidade) {
    const elemento = document.getElementById(elementoId);

    if (!elemento) return;

    const itens = Object.entries(dados);

    if (itens.length === 0) {
        elemento.innerHTML = `
            <p class="chart-empty">
                Ainda não existem dados para exibir.
            </p>
        `;
        return;
    }

    const maiorValor = Math.max(
        ...itens.map(function(item) {
            return item[1];
        }),
        1
    );

    const largura = 600;
    const alturaBarra = 42;
    const espaco = 18;
    const margemEsquerda = 125;
    const larguraMaxima = 420;
    const altura = itens.length * (alturaBarra + espaco) + 15;

    let barras = "";

    itens.forEach(function(item, indice) {
        const nome = item[0];
        const valor = item[1];

        const y = indice * (alturaBarra + espaco) + 5;
        const larguraBarra = Math.max(
            valor > 0 ? 3 : 0,
            (valor / maiorValor) * larguraMaxima
        );

        barras += `
            <text
                x="0"
                y="${y + 25}"
                class="chart-label"
            >${escaparHTML(nome)}</text>

            <rect
                x="${margemEsquerda}"
                y="${y}"
                width="${larguraBarra}"
                height="28"
                rx="7"
                class="chart-bar"
            />

            <text
                x="${margemEsquerda + larguraBarra + 9}"
                y="${y + 20}"
                class="chart-value"
            >${Number(valor).toLocaleString("pt-BR")} ${unidade}</text>
        `;
    });

    elemento.innerHTML = `
        <div class="chart-scroll">
            <svg
                viewBox="0 0 ${largura} ${altura}"
                class="chart-svg"
                role="img"
                aria-label="Gráfico de barras por cultura"
            >
                ${barras}
            </svg>
        </div>
    `;
}


// 16. ATUALIZAR OS TRÊS GRÁFICOS

function atualizarGraficos() {
    prepararGraficos();

    desenharGrafico(
        "graficoPlantacoes",
        agruparPorCultura("quantidade"),
        ""
    );

    desenharGrafico(
        "graficoAgua",
        agruparPorCultura("agua"),
        "L"
    );

    desenharGrafico(
        "graficoArea",
        agruparPorCultura("area"),
        "m²"
    );
}


// 17. ATUALIZAR RELATÓRIOS

function atualizarRelatorios() {
    const totalAgua = irrigacoes.reduce(function(total, item) {
        return total + (Number(item.quantidade) || 0);
    }, 0);

    document.getElementById("relatorioPlantacoes").textContent =
        plantacoes.length;

    document.getElementById("relatorioIrrigacoes").textContent =
        irrigacoes.length;

    document.getElementById("totalAgua").textContent =
        totalAgua.toLocaleString("pt-BR") + " litros";

    atualizarGraficos();
}


// 18. EXPORTAR RELATÓRIO CSV

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


// 19. ATUALIZAR TODO O APLICATIVO

function atualizarAplicativo() {
    mostrarPlantacoes();
    mostrarIrrigacoes();
    atualizarOpcoesIrrigacao();
    atualizarPainel();
    atualizarRelatorios();
}


// 20. INICIALIZAÇÃO

atualizarAplicativo();

console.log("AgroSmart iniciado com sucesso!");
