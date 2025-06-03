document.addEventListener('DOMContentLoaded', () => {
    // DADOS DAS EMPRESAS
    const dadosEmpresas = {
        '40': { // kW
            turbo: { carregador: 50000, instalacao: 40000 },
            mercado: { carregador: 70000, instalacao: 70000 }
        },
        '60': { // kW
            turbo: { carregador: 60000, instalacao: 50000 },
            mercado: { carregador: 100000, instalacao: 100000 }
        },
        '120': { // kW
            turbo: { carregador: 80000, instalacao: 65000 },
            mercado: { carregador: 150000, instalacao: 130000 }
        }
    };

    // ELEMENTOS DO DOM
    const selectTipoCarregador = document.getElementById('tipoCarregador');
    const comparativoInicialDiv = document.getElementById('comparativoInicial');
    const secaoParametros = document.getElementById('secao-parametros');
    const secaoProjecao = document.getElementById('secao-projecao');
    const calcularProjecaoBtn = document.getElementById('calcularProjecao');

    const inputInvestimentoInicialProjecao = document.getElementById('investimentoInicialProjecao');

    const radioBaixaTensao = document.getElementById('baixaTensao');
    const radioMediaTensao = document.getElementById('mediaTensao');
    const inputCustoKwh = document.getElementById('custoKwh');

    const radioHoras24 = document.getElementById('horas24');
    const radioHorasOutro = document.getElementById('horasOutro');
    const inputHorasCustom = document.getElementById('horasCustom');
    const radioDias30 = document.getElementById('dias30');
    const radioDiasOutro = document.getElementById('diasOutro');
    const inputDiasCustom = document.getElementById('diasCustom');
    const inputPrecoVendaKwh = document.getElementById('precoVendaKwh');

    const MEDIA_KWH_POR_RECARGA = 25; // Fixo
    document.getElementById('projMediaKwhRecarga').textContent = MEDIA_KWH_POR_RECARGA;


    // FUNÇÕES AUXILIARES
    function formatCurrency(value) {
        if (isNaN(value)) return "R$ 0,00";
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function formatNumber(value, decimalPlaces = 2) {
        if (isNaN(value)) return decimalPlaces === 0 ? "0" : "0,00"; // Adjusted for 0 decimal places
        return value.toLocaleString('pt-BR', { minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces });
    }
    
    // For ROI Mês (%) - keeps 2 decimal places for percentage
    function formatPercentage(value) {
        if (isNaN(value)) return "0,00%";
        return (value).toLocaleString('pt-BR', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // For "Taxa de Ocupação" - shows integer percentage
    function formatIntegerPercentage(value) { 
        if (isNaN(value)) return "0%";
        // value is expected as decimal, e.g., 0.05 for 5%
        return (value).toLocaleString('pt-BR', { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }


    function updateComparativoInicial() {
        const tipoSelecionado = selectTipoCarregador.value; 
        if (!tipoSelecionado) {
            comparativoInicialDiv.style.display = 'none';
            secaoParametros.style.display = 'none';
            secaoProjecao.style.display = 'none';
            return;
        }

        const dados = dadosEmpresas[tipoSelecionado];
        const turboTotal = dados.turbo.carregador + dados.turbo.instalacao;
        const mercadoTotal = dados.mercado.carregador + dados.mercado.instalacao;

        document.getElementById('turboCustoCarregador').textContent = formatCurrency(dados.turbo.carregador);
        document.getElementById('turboCustoInstalacao').textContent = formatCurrency(dados.turbo.instalacao);
        document.getElementById('turboCustoTotal').textContent = formatCurrency(turboTotal);

        document.getElementById('mercadoCustoCarregador').textContent = formatCurrency(dados.mercado.carregador);
        document.getElementById('mercadoCustoInstalacao').textContent = formatCurrency(dados.mercado.instalacao);
        document.getElementById('mercadoCustoTotal').textContent = formatCurrency(mercadoTotal);
        
        inputInvestimentoInicialProjecao.value = turboTotal.toFixed(0); 

        comparativoInicialDiv.style.display = 'flex';
        secaoParametros.style.display = 'block';
        secaoProjecao.style.display = 'none';
    }

    function handleTensaoRedeChange() {
        if (radioBaixaTensao.checked) {
            inputCustoKwh.value = radioBaixaTensao.value;
        } else if (radioMediaTensao.checked) {
            inputCustoKwh.value = radioMediaTensao.value;
        }
    }

    function handleHorasOptionChange() {
        inputHorasCustom.style.display = radioHorasOutro.checked ? 'inline-block' : 'none';
        if (!radioHorasOutro.checked) inputHorasCustom.value = '';
    }

    function handleDiasOptionChange() {
        inputDiasCustom.style.display = radioDiasOutro.checked ? 'inline-block' : 'none';
        if (!radioDiasOutro.checked) inputDiasCustom.value = '';
    }
    
    function calcularEExibirProjecao() {
        const tipoCarregadorSelecionado = selectTipoCarregador.value; 
        if (!tipoCarregadorSelecionado) {
            alert("Por favor, selecione um tipo de carregador primeiro.");
            return;
        }
        const potenciaCarregadorKW = parseFloat(tipoCarregadorSelecionado);
        const investimentoInicial = parseFloat(inputInvestimentoInicialProjecao.value);

        if (isNaN(investimentoInicial) || investimentoInicial <= 0) {
            alert("Por favor, insira um valor de Investimento Inicial válido para a projeção.");
            inputInvestimentoInicialProjecao.focus();
            return;
        }

        const custoKwhOperacao = parseFloat(inputCustoKwh.value);
        const precoVendaKwhOperacao = parseFloat(inputPrecoVendaKwh.value);

        let horasFuncionamentoDia = radioHorasOutro.checked ? parseFloat(inputHorasCustom.value) : parseFloat(radioHoras24.value);
        let diasFuncionamentoMes = radioDiasOutro.checked ? parseFloat(inputDiasCustom.value) : parseFloat(radioDias30.value);

        if (radioHorasOutro.checked && (isNaN(horasFuncionamentoDia) || horasFuncionamentoDia <= 0 || horasFuncionamentoDia > 24)) {
            alert("Por favor, insira um valor válido para horas de funcionamento (1-24)."); return;
        }
        if (radioDiasOutro.checked && (isNaN(diasFuncionamentoMes) || diasFuncionamentoMes <= 0 || diasFuncionamentoMes > 31)) {
            alert("Por favor, insira um valor válido para dias de funcionamento (1-31)."); return;
        }
        if(isNaN(custoKwhOperacao) || custoKwhOperacao < 0 || isNaN(precoVendaKwhOperacao) || precoVendaKwhOperacao < 0) {
            alert("Custos e preços de kWh devem ser valores numéricos válidos e positivos."); return;
        }

        document.getElementById('projInvestimento').textContent = formatCurrency(investimentoInicial);
        document.getElementById('projCustoKwh').textContent = custoKwhOperacao.toFixed(2);
        document.getElementById('projPrecoVendaKwh').textContent = precoVendaKwhOperacao.toFixed(2);
        document.getElementById('projHorasDia').textContent = horasFuncionamentoDia;
        document.getElementById('projDiasMes').textContent = diasFuncionamentoMes;
        document.getElementById('projPotenciaCarregador').textContent = potenciaCarregadorKW;

        const taxasOcupacao = [0.05, 0.10, 0.15, 0.20, 0.25, 0.30]; // These are decimals (0.05 = 5%)
        const tabelaProjecaoBody = document.getElementById('tabelaProjecao');
        tabelaProjecaoBody.innerHTML = '';

        taxasOcupacao.forEach(taxa => {
            const kwhMes = (horasFuncionamentoDia * diasFuncionamentoMes) * potenciaCarregadorKW * taxa;
            
            const recargasMesFloat = kwhMes / MEDIA_KWH_POR_RECARGA;
            const recargasDiaFloat = recargasMesFloat / diasFuncionamentoMes; // Use float for precision before rounding

            const recargasMesRounded = Math.round(recargasMesFloat);
            const recargasDiaRounded = Math.round(recargasDiaFloat);
            
            const receitaBrutaMes = precoVendaKwhOperacao * kwhMes;
            const deducoesPISCOFINS = receitaBrutaMes * 0.0865; 
            const receitaLiquida = receitaBrutaMes - deducoesPISCOFINS;
            
            const custosApp = receitaBrutaMes * 0.08;
            const custoEnergiaMes = custoKwhOperacao * kwhMes;
            
            const margem = receitaLiquida - custosApp - custoEnergiaMes;
            
            const opex = (investimentoInicial * 0.10) / 12;
            
            const resultadoBrutoProj = margem - opex;
            
            const impostosResultado = receitaBrutaMes * 0.32 * 0.34; 
            
            const resultadoLiquidoProj = resultadoBrutoProj - impostosResultado;
            
            let roiMes = 0;
            if (investimentoInicial > 0) {
                roiMes = resultadoLiquidoProj / investimentoInicial; 
            }

            let paybackMeses = "N/A";
            if (resultadoLiquidoProj > 0 && investimentoInicial > 0) {
                paybackMeses = formatNumber(investimentoInicial / resultadoLiquidoProj, 1);
            } else if (resultadoLiquidoProj <= 0 && investimentoInicial > 0) {
                paybackMeses = "Inválido (>0)";
            }

            const row = tabelaProjecaoBody.insertRow();
            row.insertCell().textContent = formatIntegerPercentage(taxa); // Correctly formats 0.05 as "5%"
            row.insertCell().textContent = formatNumber(kwhMes, 0); // No decimals
            row.insertCell().textContent = formatNumber(recargasMesRounded, 0); // Rounded, no decimals
            row.insertCell().textContent = formatNumber(recargasDiaRounded, 0); // Rounded, no decimals
            row.insertCell().textContent = formatCurrency(receitaBrutaMes);
            row.insertCell().textContent = formatCurrency(deducoesPISCOFINS);
            row.insertCell().textContent = formatCurrency(receitaLiquida);
            row.insertCell().textContent = formatCurrency(custosApp);
            row.insertCell().textContent = formatCurrency(custoEnergiaMes);
            row.insertCell().textContent = formatCurrency(margem);
            row.insertCell().textContent = formatCurrency(opex);
            row.insertCell().textContent = formatCurrency(resultadoBrutoProj);
            row.insertCell().textContent = formatCurrency(impostosResultado);
            row.insertCell().textContent = formatCurrency(resultadoLiquidoProj);
            
            const roiCell = row.insertCell();
            roiCell.textContent = formatPercentage(roiMes); // Keeps 2 decimal places for ROI percentage
            roiCell.classList.add('highlight-data');

            const paybackCell = row.insertCell();
            paybackCell.textContent = paybackMeses;
            paybackCell.classList.add('highlight-data');
        });

        secaoProjecao.style.display = 'block';
        secaoProjecao.scrollIntoView({ behavior: 'smooth' });
    }

    // EVENT LISTENERS
    selectTipoCarregador.addEventListener('change', updateComparativoInicial);
    
    radioBaixaTensao.addEventListener('change', handleTensaoRedeChange);
    radioMediaTensao.addEventListener('change', handleTensaoRedeChange);
    
    radioHoras24.addEventListener('change', handleHorasOptionChange);
    radioHorasOutro.addEventListener('change', handleHorasOptionChange);
    
    radioDias30.addEventListener('change', handleDiasOptionChange);
    radioDiasOutro.addEventListener('change', handleDiasOptionChange);

    calcularProjecaoBtn.addEventListener('click', calcularEExibirProjecao);

    // Inicialização
    handleHorasOptionChange();
    handleDiasOptionChange();
    if(radioBaixaTensao.checked || radioMediaTensao.checked) handleTensaoRedeChange();
    else { radioBaixaTensao.checked = true; handleTensaoRedeChange(); }
});