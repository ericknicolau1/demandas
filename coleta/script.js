document.addEventListener('DOMContentLoaded', function() {
    const turnoSelect = document.getElementById('turno');
    const horarioAulaTable = document.getElementById('horarioAula');

    function populateTimeSelects(row) {
        const horaInicioSelect = row.querySelector('.horaInicio');
        const minutoInicioSelect = row.querySelector('.minutoInicio');
        const horaTerminoSelect = row.querySelector('.horaTermino');
        const minutoTerminoSelect = row.querySelector('.minutoTermino');

        if (horaInicioSelect && minutoInicioSelect && horaTerminoSelect && minutoTerminoSelect) {
            horaInicioSelect.innerHTML = '<option value="">Selecione</option>';
            horaTerminoSelect.innerHTML = '<option value="">Selecione</option>';
            minutoInicioSelect.innerHTML = '<option value="">Selecione</option>';
            minutoTerminoSelect.innerHTML = '<option value="">Selecione</option>';

            const turno = turnoSelect.value;
            let startHour = turno === 'Manhã' ? 6 : 12;
            const endHour = turno === 'Manhã' ? 14 : 19;

            for (let i = startHour; i < endHour; i++) {
                const formattedHour = String(i).padStart(2, '0');
                horaInicioSelect.innerHTML += `<option value="${formattedHour}">${formattedHour}</option>`;
                horaTerminoSelect.innerHTML += `<option value="${formattedHour}">${formattedHour}</option>`;
            }

            for (let i = 0; i < 60; i++) {
                const formattedMinute = String(i).padStart(2, '0');
                minutoInicioSelect.innerHTML += `<option value="${formattedMinute}">${formattedMinute}</option>`;
                minutoTerminoSelect.innerHTML += `<option value="${formattedMinute}">${formattedMinute}</option>`;
            }
        }
    }

    turnoSelect.addEventListener('change', function() {
        const rows = horarioAulaTable.querySelectorAll('tbody tr');
        rows.forEach(populateTimeSelects);
    });

    const rows = horarioAulaTable.querySelectorAll('tbody tr');
    rows.forEach(populateTimeSelects);
});

function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Configurações
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    const contentWidth = pageWidth - (margin * 2);
    const rowHeight = 10;
    const headerColor = '#04456D'; // Azul claro
    let y = margin;

    // Função auxiliar para criar cabeçalhos azuis
    function criarCabecalho(texto, posY) {
        doc.setFillColor(headerColor);
        doc.rect(margin, posY, contentWidth, rowHeight, 'F');
        doc.setTextColor(255, 255, 255); // Texto branco
        doc.setFontSize(12);
        doc.text(texto, pageWidth / 2, posY + rowHeight - 2, { align: 'center' });
        doc.setTextColor(0, 0, 0); // Volta para texto preto
        return posY + rowHeight;
    }

    // Função auxiliar para criar campos de formulário
    function criarCampo(texto, valor, posY, fullWidth = false, secondField = null, secondValue = null) {
        const fieldWidth = fullWidth ? contentWidth : contentWidth / 2 - 2;
        
        // Primeiro campo
        doc.setFontSize(10);
        doc.setFillColor(230, 230, 230);
        doc.rect(margin, posY, fieldWidth, rowHeight, 'F');
        doc.setFontSize(10);
        doc.text(texto, margin + 2, posY + rowHeight - 2);
        
        // Valor do primeiro campo
        doc.setFillColor(255, 255, 255);
        doc.rect(margin, posY + rowHeight, fieldWidth, rowHeight, 'F');
        doc.text(valor || '', margin + 2, posY + rowHeight * 2 - 2);
        
        // Se houver segundo campo
        if (!fullWidth && secondField) {
            const secondX = margin + fieldWidth + 4;
            
            // Segundo campo
            doc.setFillColor(230, 230, 230);
            doc.rect(secondX, posY, fieldWidth, rowHeight, 'F');
            doc.text(secondField, secondX + 2, posY + rowHeight - 2);
            
            // Valor do segundo campo
            doc.setFillColor(255, 255, 255);
            doc.rect(secondX, posY + rowHeight, fieldWidth, rowHeight, 'F');
            doc.text(secondValue || '', secondX + 2, posY + rowHeight * 2 - 2);
        }
        
        return posY + rowHeight * 2;
    }

    // Título
    y = criarCabecalho('COLETA DE CLASSE - EDUCAÇÃO ESPECIAL', y);
    
    // 1. Tipo de Sala
    y = criarCampo('1. Informe o Tipo de Sala', document.getElementById('tipoSala').value, y, true);
    
    // 2. Tipo de Ensino e 3. Turma (lado a lado)
    y = criarCampo('2. Informe o Tipo de Ensino', document.getElementById('tipoEnsino').value, y, false, 
                   '3. Informe a Turma', document.getElementById('turma').value);
    
    // 4. Turno
    y = criarCampo('4. Informe o Turno', document.getElementById('turno').value, y, true);
    
    // 5. Horário da Aula
    y = criarCabecalho('5. Horário da Aula', y);
    
    // Tabela de horários
    const colunas = ['Aula', 'Dias', 'Horário Início', 'Horário Término'];
    const colWidths = [contentWidth * 0.1, contentWidth * 0.3, contentWidth * 0.3, contentWidth * 0.3];
    
    // Cabeçalho da tabela
    let currentX = margin;
    doc.setFillColor(240, 240, 240);
    for (let i = 0; i < colunas.length; i++) {
        doc.rect(currentX, y, colWidths[i], rowHeight, 'F');
        doc.text(colunas[i], currentX + colWidths[i]/2, y + rowHeight - 2, { align: 'center' });
        currentX += colWidths[i];
    }
    y += rowHeight;
    
    // Linhas da tabela
    const rows = document.querySelectorAll('#horarioAula tbody tr');
    rows.forEach((row, index) => {
        currentX = margin;
        const dia = row.querySelector('.diaSemana').value || '';
        const horaInicio = row.querySelector('.horaInicio').value || '';
        const minutoInicio = row.querySelector('.minutoInicio').value || '';
        const horaTermino = row.querySelector('.horaTermino').value || '';
        const minutoTermino = row.querySelector('.minutoTermino').value || '';
        
        const horarioInicio = `${horaInicio}:${minutoInicio}`;
        const horarioTermino = `${horaTermino}:${minutoTermino}`;
        
        const rowData = [`${index + 1}ª`, dia, horarioInicio, horarioTermino];
        
        for (let i = 0; i < rowData.length; i++) {
            doc.rect(currentX, y, colWidths[i], rowHeight);
            doc.text(rowData[i], currentX + colWidths[i]/2, y + rowHeight - 2, { align: 'center' });
            currentX += colWidths[i];
        }
        y += rowHeight;
    });
    
    // 6. Tipo de Classe e 7. Data Início
    y += 2; // Pequeno espaço
    y = criarCampo('6. Tipo de Classe', document.getElementById('tipoClasse').value, y, false,
                   '7. Data Início', document.getElementById('dataInicio').value);
    
   // 8. Atividade de Recurso
   y = criarCabecalho('8. Atividade de Recurso', y);

   const atividades = document.querySelectorAll('input[name="atividadeRecurso"]');
   const atividadesSelecionadas = Array.from(atividades).filter(atividade => atividade.checked);

   if (atividadesSelecionadas.length > 0) {
       const atividadesPorColuna = Math.ceil(atividadesSelecionadas.length / 2);
       const colWidth = contentWidth / 2;

       for (let i = 0; i < atividadesPorColuna; i++) {
           // Primeira coluna
           if (i < atividadesSelecionadas.length) {
               doc.setFillColor(255, 255, 255); // Garante o preenchimento branco
               doc.rect(margin, y, colWidth, rowHeight, 'F');
               doc.text(atividadesSelecionadas[i].value, margin + 2, y + rowHeight - 2);
           }

           // Segunda coluna
           const segundoIndice = i + atividadesPorColuna;
           if (segundoIndice < atividadesSelecionadas.length) {
               doc.setFillColor(255, 255, 255); // Garante o preenchimento branco
               doc.rect(margin + colWidth, y, colWidth, rowHeight, 'F');
               doc.text(atividadesSelecionadas[segundoIndice].value, margin + colWidth + 2, y + rowHeight - 2);
           }

           y += rowHeight;
       }
   } else {
       doc.setFillColor(255, 255, 255); // Garante o preenchimento branco
       doc.rect(margin, y, contentWidth, rowHeight, 'F');
       y += rowHeight;
   }
    
    // 9. Número da Sala
    y += 2; // Pequeno espaço
    y = criarCabecalho('9. Número da Sala', y);
    
    // Campo do número da sala
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, rowHeight, 'F');
    doc.text(document.getElementById('numeroSala').value, margin + 2, y + rowHeight - 2);
    y += rowHeight;
    
    // Observações
    y += 2; // Pequeno espaço
    y = criarCabecalho('Observações', y);
    
    // Campo de texto para observações
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, rowHeight * 2, 'F');
    doc.text(document.getElementById('observacoes').value, margin + 2, y + rowHeight - 2);
    y += rowHeight * 2 + 2;
    
    // Rodapé
    
    
    doc.save('coleta_classe.pdf');
}
