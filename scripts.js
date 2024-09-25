document.getElementById('antennaForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get input values
    const shape = document.getElementById('shape').value;
    const ε_r = parseFloat(document.getElementById('dielectricConstant').value);
    
    // Get substrate thickness and convert to meters
    const hValue = parseFloat(document.getElementById('thickness').value);
    const hUnit = document.getElementById('thicknessUnit').value;
    const h = convertToMeters(hValue, hUnit);
    
    // Get frequency and convert to Hz
    const frequencyValue = parseFloat(document.getElementById('frequency').value);
    const frequencyUnit = document.getElementById('frequencyUnit').value;
    const f_r = convertToHertz(frequencyValue, frequencyUnit);

    let W, L, a, b, S, ε_eff, c = 3e8;

    // Calculate dimensions based on the selected shape
    switch (shape) {
        case 'rectangular':
            console.log(`f = ${f_r}`);
            console.log(`ε_r = ${ε_r}`);
            console.log(`h = ${h}`);
            
            // Calculate width
            W = c / (2 * f_r * Math.sqrt((ε_r + 1) / 2));
            console.log("Width: " + W);

            // Calculate effective dielectric constant
            ε_eff = (ε_r + 1) / 2 + ((ε_r - 1) / 2) * (1 / Math.sqrt(1 + 12 * h / W));

            // Calculate effective length
            const L_eff = c / (2 * f_r * Math.sqrt(ε_eff));

            // Calculate length extension
            const delta_L = (0.412 * h) * (((ε_eff + 0.3) * ((W / h) + 0.264)) / ((ε_eff - 0.258) * ((W / h) + 0.8)));

            // Calculate actual length
            L = L_eff - 2 * delta_L;

            console.log("Length: " + L);

            break;
        case 'circular':
            const F = 8.791e9 / (f_r * Math.sqrt(ε_r)) * 10;
            console.log(`F = ${F}`);
            a = F / Math.sqrt(1 + (2 * h) / (Math.PI * ε_r * F) * Math.log((Math.PI*F) / (2*h) + 1.7726)) / 1000

            console.log(`a = ${a}`);

            break;
        case 'elliptical':
            const aEllipse = (c / (2 * f_r * Math.sqrt(ε_eff)));
            const eccentricity = 0.5; // Adjust as needed
            a = aEllipse;
            b = a * eccentricity;
            break;
        case 'triangular':
            // Calculate width
            S = (2 * c) / (3 * f_r * Math.sqrt(ε_r));
            break;
        default:
            alert('Please select a valid shape.');
            return;
    }

    // Show results in original input units
    displayResults(W, L, a, b, S, shape, hUnit, frequencyUnit);
});

function displayResults(W, L, a, b, S, shape, hUnit, frequencyUnit) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.classList.remove('hidden');
    
    // Clear previous results
    document.getElementById('step1').innerHTML = '';
    document.getElementById('step2').innerHTML = '';
    document.getElementById('step3').innerHTML = '';
    
    // Convert dimensions back to original units for display
    const W_display = convertFromMeters(W, 'm', hUnit);
    const L_display = convertFromMeters(L, 'm', hUnit);
    const a_display = convertFromMeters(a, 'm', hUnit);
    const b_display = convertFromMeters(b, 'm', hUnit);
    const S_display = convertFromMeters(S, 'm', hUnit);

    // Display calculated dimensions based on shape
    switch (shape) {
        case 'rectangular':
            document.getElementById('step1').innerHTML = `<p><strong>Width (W):</strong> ${W_display.toFixed(4)} ${hUnit}</p>`;
            document.getElementById('step2').innerHTML = `<p><strong>Length (L):</strong> ${L_display.toFixed(4)} ${hUnit}</p>`;
            document.getElementById('step3').innerHTML = `
                <p><strong>Equations:</strong></p>
                <p>Width: $$W = \\frac{c}{2 f_r \\sqrt{\\frac{\\varepsilon_r + 1}{2}}}$$</p>
                <p>Effective Dielectric Constant: $$\\varepsilon_{eff} = \\frac{\\varepsilon_r + 1}{2} + \\frac{\\varepsilon_r - 1}{2} \\left(1 + \\frac{12h}{W}\\right)^{-0.5}$$</p>
                <p>Length: $$L = L_{eff} - 2 \\Delta L$$ where $$\\Delta L = 0.412h \\cdot \\frac{(\\varepsilon_{eff} + 0.3)(W/h + 0.264)}{(\\varepsilon_{eff} - 0.258)(W/h + 0.8)}$$</p>
            `;
            break;
        case 'circular':
            document.getElementById('step1').innerHTML = `<p><strong>Radius (a):</strong> ${a_display.toFixed(4)} ${hUnit}</p>`;
            document.getElementById('step3').innerHTML = `
                <p><strong>Equations:</strong></p>
                <p>For Circular Patch: $$F = \\frac{8.791 \\times 10^9}{f_r \\sqrt{\\varepsilon_r}}$$<b>F will be in cm, multiply with 10 to convert to mm (no need to convert to m)\n</b></p>
                <p>Physical Radius: $$a = \\frac{F}{\\sqrt{1 + \\frac{2h}{\\pi \\varepsilon_r F} \\ln{\\left(\\frac{\\pi F}{2h} + 1.7726\\right)}}}$$</p>
                <p><b>a is in mm</b><p>
            `;
            break;
        case 'elliptical':
            // document.getElementById('step1').innerHTML = `<p><strong>Semi-Major Axis (a):</strong> ${a_display.toFixed(4)} ${hUnit}</p>`;
            // document.getElementById('step2').innerHTML = `<p><strong>Semi-Minor Axis (b):</strong> ${b_display.toFixed(4)} ${hUnit}</p>`;
            // document.getElementById('step3').innerHTML = `
            //     <p><strong>Equation:</strong></p>
            //     <p>For Elliptical Patch: $$a = \\frac{c}{2 f_r \\sqrt{\\varepsilon_{eff}}}$$</p>
            // `;
            document.getElementById('step1').innerHTML = `<p><b>Equation for elliptical patch is yet not confirmed!</b></p>`;
            break;
        case 'triangular':
            document.getElementById('step1').innerHTML = `<p><strong>Side Length (S):</strong> ${S_display.toFixed(4)} ${hUnit}</p>`;
            document.getElementById('step3').innerHTML = `
                <p><strong>Equation:</strong></p>
                <p>For Triangular Patch: $$S = \\frac{2c}{3 f_r \\sqrt{\\varepsilon_r}}$$</p>
            `;
            break;
    }

    // Trigger MathJax to render the equations
    MathJax.typeset();
}

// Convert back from meters to the original unit
function convertFromMeters(value, fromUnit, toUnit) {
    const valueInMeters = value; // Assume input is in meters
    switch (toUnit) {
        case 'm': return valueInMeters;
        case 'mm': return valueInMeters * 1000;
        case 'µm': return valueInMeters * 1e6;
        case 'cm': return valueInMeters * 100;
        case 'in': return valueInMeters / 0.0254; // Meters to inches
        default: return valueInMeters;
    }
}

// The existing functions remain unchanged...
function convertToMeters(value, unit) {
    switch (unit) {
        case 'm': return value;
        case 'mm': return value / 1000;
        case 'µm': return value / 1e6;
        case 'cm': return value / 100;
        case 'in': return value * 0.0254; // Inches to meters
        default: return value;
    }
}

function convertToHertz(value, unit) {
    switch (unit) {
        case 'Hz': return value;
        case 'kHz': return value * 1e3;
        case 'MHz': return value * 1e6;
        case 'GHz': return value * 1e9;
        case 'THz': return value * 1e12;
        default: return value;
    }
}
