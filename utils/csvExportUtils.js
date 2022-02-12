import image64 from 'image-to-base64'
import xl from 'excel4node'
import fs, { appendFileSync } from "fs";
import axios from 'axios'
const ws = fs.createWriteStream("data.csv");
const prefix = "https://attendance-serviceku.herokuapp.com/s3/image/"
fs.read
const createCsv = async (list = []) => {
    try {

        // Create a new instance of a Workbook class
        var wb = new xl.Workbook();

        // Add Worksheets to the workbook
        var ws = wb.addWorksheet('Sheet 1');

        // Create a reusable style
        var style = wb.createStyle({
            font: {
                color: '#FF0800',
                size: 12,
            },
            numberFormat: '$#,##0.00; ($#,##0.00); -',
        });
        let array = []
        ws.cell(1, 1).string('Nama').style(style)
        ws.cell(1, 2).string('Image 1').style(style)
        ws.cell(1, 3).string('Image 2').style(style)
        let idxRow = 2;
        let idxColumnt = 1;
        for (let index = 0; index < 1; index++) {
            const item = list[index];
            console.log(prefix + item.images[1])
            ws.cell(idxRow, idxColumnt).string(item.nama).style(style)
            const fileUrl1 = `./uploads/${item.nama}1.png`;
            await downloadImage(prefix + item.images[0], fileUrl1)
            ws.addImage({
                image: fs.readFileSync(fileUrl1),
                type: 'picture',
                position: {
                    type: 'oneCellAnchor',
                    from: {
                        col: idxRow,
                        colOff: '0.5in',
                        row: idxColumnt + 1,
                        rowOff: 0,
                    },
                },
            })
            const fileUrl2 = `./uploads/${item.nama}2.png`
            await downloadImage(prefix+item.images[1], fileUrl2)
            ws.addImage({
                image: fs.readFileSync(fileUrl2),
                type: 'picture',
                position: {
                    type: 'oneCellAnchor',
                    from: {
                        col: idxRow,
                        colOff: '0.5in',
                        row: idxColumnt + 2,
                        rowOff: 0,
                    },
                },
            })

            idxRow++

        }

        wb.write('Excel.xlsx');

    } catch (error) {
        console.log(error)
    }
}



async function downloadImage(url, filepath) {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });
    return new Promise((resolve, reject) => {
        response.data.pipe(fs.createWriteStream(filepath))
            .on('error', reject)
            .once('close', () => resolve(filepath)); 
    });
}
export default createCsv