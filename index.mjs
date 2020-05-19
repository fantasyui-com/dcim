import fs from 'fs-extra';
import take from 'lodash/take.js';
import pad from 'lodash/pad.js';
import path from 'path';
import glob from 'glob';
import byKey from 'natural-sort-by-key';
import exif from 'exif';
import moment from 'moment';

const ExifImage = exif.ExifImage;

async function getFiles(location) {
  return new Promise(function(resolve, reject) {
    glob("**/*", {
      cwd: location,
      absolute: true,
      dot: false
    }, function(error, files) {
      if (error)
        return reject(error);
      resolve(files);
    })
  });
}
async function getInfo(location) {
  return new Promise(function(resolve, reject) {
    new ExifImage({
      image: location
    }, function(error, exifData) {
      if (error)
        return reject(error);
      resolve(exifData);
    });
  });
}


function toDate(year = 2020, month = 0, day = 1, hour = 0, minute=0, second=0, millisecond=0){

  let [intYear, intMonth, intDay, intHour, intMinute, intSecond, intMillisecond] = [year, month, day, hour, minute, second, millisecond].map(i=>parseInt(i));

  intMonth--;

  let response = new Date(intYear, intMonth, intDay, intHour, intMinute, intSecond, intMillisecond);

  // console.log(`${year}-${month}-${day}`, response);
  //
  // if(response.toString().startsWith())

  return response;


}

function dateDecode(location) {
  let response = new Date(fs.lstatSync(location).ctime);
  const fileName = path.basename(location);
  const justName = path.basename(fileName, path.extname(fileName));

  //console.log(justName);

  if (justName.length == 13) {
    let epoch = parseInt(justName);
    // epoch
    const response = new Date(0); // The 0 there is the key, which sets the date to the epoch
    response.setUTCSeconds(epoch / 1000);
    return response;
  }

  const match1 = fileName.match(/IMG_(?<year>\d\d\d\d)(?<month>\d\d)(?<day>\d\d)_(?<hour>\d\d)(?<minute>\d\d)(?<second>\d\d)/);
  if (match1) {
    response = toDate(match1.groups.year, match1.groups.month, match1.groups.day, match1.groups.hour, match1.groups.minute, match1.groups.second);
    // console.log('Decoding date form a filename.... [%s] -> [%s]', fileName, response);
    return response;
  }

  const match2 = fileName.match(/VID_(?<year>\d\d\d\d)(?<month>\d\d)(?<day>\d\d)_(?<hour>\d\d)(?<minute>\d\d)(?<second>\d\d)/);
  if (match2) {
    response = toDate(match2.groups.year, match2.groups.month, match2.groups.day, match2.groups.hour, match2.groups.minute, match2.groups.second);
    // console.log('Decoding date form a filename.... [%s] -> [%s]', fileName, response);
    return response;
  }

  const match3 = fileName.match(/video-(?<year>\d\d\d\d)-(?<month>\d\d)-(?<day>\d\d)-(?<hour>\d\d)-(?<minute>\d\d)-(?<second>\d\d)/);
  if (match3) {
    response = toDate(match3.groups.year, match3.groups.month, match3.groups.day, match3.groups.hour, match3.groups.minute, match3.groups.second);
    // console.log('Decoding date form a filename.... [%s] -> [%s]', fileName, response);
    return response;
  }

  const match4 = fileName.match(/(?<year>\d\d\d\d)-(?<month>\d\d)-(?<day>\d\d) (?<hour>\d\d).(?<minute>\d\d).(?<second>\d\d)/);
  if (match4) {
    response = toDate(match4.groups.year, match4.groups.month, match4.groups.day, match4.groups.hour, match4.groups.minute, match4.groups.second);
    // console.log('Decoding date form a filename.... [%s] -> [%s]', fileName, response);
    return response;
  }

  const match5 = fileName.match(/(?<year>\d\d\d\d)(?<month>\d\d)(?<day>\d\d)(?<hour>\d\d)(?<minute>\d\d)(?<second>\d\d)/);
  if (match5) {
    response = toDate(match5.groups.year, match5.groups.month, match5.groups.day, match5.groups.hour, match5.groups.minute, match5.groups.second);
    // console.log('Decoding date form a filename.... [%s] -> [%s]', fileName, response);
    return response;
  }
  const match6 = fileName.match(/(?<year>\d\d\d\d)(?<month>\d\d)(?<day>\d\d)_(?<hour>\d\d)(?<minute>\d\d)(?<second>\d\d)/);
  if (match6) {
    response = toDate(match6.groups.year, match6.groups.month, match6.groups.day, match6.groups.hour, match6.groups.minute, match6.groups.second);
    // console.log('Decoding date form a filename.... [%s] -> [%s]', fileName, response);
    return response;
  }

  console.log('Unmatched date, returning file date', fileName, response);
  return response;
}

async function execute({sources, destination}) {

  if (!sources.length)
    throw new Error("Source(s) Required");
  console.log(sources);

  if (!destination)
    throw new Error("Destination Required");
  fs.ensureDirSync(destination);
  console.log(destination);

  let allFiles = [];

  for (let location of sources) {
    let set = (await getFiles(location))
    .filter(s => fs.lstatSync(s).isFile())
    .filter(s => fs.lstatSync(s).size>0)
    allFiles = allFiles.concat(set);
  }

  const jpgFiles = allFiles.filter(s => s.toLowerCase().endsWith('.jpg'));
  const nonJpgFiles = allFiles.filter(s => !s.toLowerCase().endsWith('.jpg'));

  const others = Array.from(new Set(nonJpgFiles.map(s => path.extname(s))));

  console.log(`Found ${allFiles.length} files.`);
  console.log(`Found ${jpgFiles.length} jpg files.`);
  console.log(`Found ${nonJpgFiles.length} non-jpg files (${others.join(', ')}).`);

  const dated = [];

  {
    let index = 1;
    for (let location of jpgFiles) {

      try {
        const info = await getInfo(location);
        if (!info.image.ModifyDate) {
          console.log(index, location);
          console.log(info);
          console.error(`No info.image.ModifyDate`, location);
          console.error(error);
          dated.push({type: 'image', location, date: dateDecode(location)});
        } else {
          // console.log(info.exif.DateTimeOriginal);
          // console.log(info.image.ModifyDate);
          const match1 = info.image.ModifyDate.match(/(?<year>\d\d\d\d):(?<month>\d\d):(?<day>\d\d) (?<hour>\d\d):(?<minute>\d\d):(?<second>\d\d)/);
          const match2 = info.image.ModifyDate.match(/(?<day>\d\d)\/(?<month>\d\d)\/(?<year>\d\d\d\d) (?<hour>\d+):(?<minute>\d\d)/);

          if (match1) {
            let response = toDate(match1.groups.year, match1.groups.month, match1.groups.day, match1.groups.hour, match1.groups.minute, match1.groups.second);
            dated.push({type: 'image', location, date: response});
            // console.log('Decoding date form a filename.... [%s] -> [%s]', fileName, response);
          } else if (match2) {
            let response = toDate(match2.groups.year, match2.groups.month, match2.groups.day, match2.groups.hour, match2.groups.minute, 0);
            console.log(JSON.stringify(match2.groups), response);
            dated.push({type: 'image', location, date: response});
            // console.log('Decoding date form a filename.... [%s] -> [%s]', fileName, response);

          } else {
            console.log('Malformed Exif Date, gegex did not parse [%s] at [%s]', info.image.ModifyDate, location);
          }

        }

      } catch (e) {
        //console.log(e);
        //.error(e);
        console.error(e.code, location);
        dated.push({type: 'image', location, date: dateDecode(location)});
      }
      index++;
    }
  } {
    let index = 1;
    for (let location of nonJpgFiles) {
      //console.log(location);
      dated.push({type: path.extname(location).substr(1), location, date: dateDecode(location)});
      index++;
    }
  }

  // nonJpgFiles, store in a folder by ext, decode date from filename
  // dated store in folders by year, month, day
  // misc decode date from filename

  {
    let index = 1;
    for (let item of dated) {
      const year = item.date.getFullYear();
      if (year > (new Date).getFullYear()) {
        console.error('Date is in the future', item);
      }
      index++;
    }
  } {
    let index = 1;
    for (let item of dated) {

      // const year = item.date.getFullYear();
      // const month = item.date.toLocaleString('default', {month: 'long'});
      // let targetDir = path.join(path.resolve(destination), item.type, year + '', month)


      const fullYear = moment(item.date).format('YYYY'); // 2020
      const monthNumber = pad(moment(item.date).format('MM'),2,'0'); // 04
      const monthName = moment(item.date).format('MMMM'); // May
      const dayName = moment(item.date).format('Do'); // 19th

      let targetDir = path.resolve( path.join( destination, fullYear, [monthNumber,monthName,dayName].join('-') ) );

      let newExt = path.extname(item.location)
      let newName = item.date.getTime() + newExt;

      //console.log(targetDir);
      fs.ensureDirSync(targetDir);
      const target = path.join(targetDir, newName);
      fs.copy(item.location, target);

      index++;
    }
  }

}

export {
  execute
};
