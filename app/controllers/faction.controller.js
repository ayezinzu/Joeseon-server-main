const factions = 'app/factions/';
const fs = require('fs');

exports.getFactions = function(req,res){
    factionList = []
    fs.readdirSync(factions).forEach(file => {
        factionFile = file.split(".faction")[0]
        factionList.push(factionFile);
        console.log(factionFile);
      });
    res.status(200).send(factionList)
}