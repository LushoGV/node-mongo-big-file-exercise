const Records = require("./records.model");
const fs = require("fs");

const upload = async (req, res) => {
  const { file } = req;

  fs.readFile(`./${file.path}`, "utf-8", async (error, archivo) => {

    if(error) return res.status(400).json({ error: error });

    //Divido el archivo en arrays, usando como punto de separación los saltos de linea
    const recordsArr = archivo.split("\r\n");

    //Función que retorna el registro acorde al modelo de la base de datos
    const recordObj = (recordDataCol) => {
        const recordTitlesCol = recordsArr[0].split(",");
        let test = {}
        
        recordTitlesCol.map((element, index) => {
            test = {...test, [element]: recordDataCol[index]}
        })

        return test
    }

    // Recorro el array del archivo y subo cada registro
    for (let i = 0; i <= recordsArr.length; i++) {
      try {
        //Se empieza por el 1 ya que el i = 0 son titulos (id, username, ...)
        let recordCol = recordsArr[i + 1].split(",");
        const newRecordData = recordObj(recordCol)

        const recordFinded = await Records.find(newRecordData)

        //Se hace una busqueda previa para evitar subir repetidos
        if(!recordFinded.length){
          let newRecord = await Records(newRecordData);

          await newRecord.save();
        }

      } catch (err) {
        return res.status(400).json({ error: err });
      }
    }
  });

  return res.status(200).json({ message: "some response" });
};

const list = async (_, res) => {
  try {
    const data = await Records.find({}).limit(10).lean();

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json(err);

  }
};

module.exports = {upload, list};
