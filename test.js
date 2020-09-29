const getData = async function(configData) {
    try{

    }catch (error) {
        console.log('Catched error message', error.message);
        console.log('Catched error stack', error.stack);
        console.log('Catched error ', error);
      }
}



// To Store Data in File
const storeDataToFile = async function(file, data) {
    console.log(data);
    return fs.writeFileSync(file, JSON.stringify(data), err => {
      if (err) {
        logger.error('error: ', JSON.stringify(err, null, 2));
        return err;
      }
      return;
    });
}

getData();