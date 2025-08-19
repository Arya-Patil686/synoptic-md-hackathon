document.addEventListener('DOMContentLoaded', () => {

    const loadButton = document.getElementById('load-data-button');
    const summaryText = document.getElementById('summary-text');

    function loadPatientSummary() {
        summaryText.textContent = 'ALERT: Patient has high blood pressure. Recommend follow-up.';
        console.log('Patient data loaded!');
    }

    loadButton.addEventListener('click', loadPatientSummary);
});