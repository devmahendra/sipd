const xlsx = require('xlsx');

async function processExcelImport({
    buffer,
    validator,
    mapper,
    rowProcessor,
    }) {
    const result = { success: [], failed: [] };

    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = xlsx.utils.sheet_to_json(sheet);

    for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        const rowNum = i + 2; // Excel row (1-based + header)

        try {
        // 1. Validate raw flat row
        const { value, error } = validator.validate(row, { abortEarly: false });
        if (error) {
            result.failed.push({
            row: rowNum,
            error: error.details.map(d => d.message).join(', '),
            });
            continue;
        }

        // 2. Map to your nested structure
        const mapped = mapper(value);

        // 3. Call insert/update/delete function
        await rowProcessor(mapped, rowNum); // service layer handles approval etc

        result.success.push({ row: rowNum });
        } catch (err) {
        result.failed.push({
            row: rowNum,
            error: err.message || 'Unexpected error',
        });
        }
    }

    result.summary = {
        total: rawData.length,
        success: result.success.length,
        failed: result.failed.length,
    };

    return result;
}

module.exports = { processExcelImport };
