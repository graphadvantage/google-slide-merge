// Code.gs
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index').setTitle("Google Slide Merger");;
}

function getFolderContents(folderUrl) {
  try {
    const folderId = folderUrl.split('/folders/')[1].split('?')[0];
    const folder = DriveApp.getFolderById(folderId);
    const files = folder.getFiles();
    const fileData = [];
    while (files.hasNext()) {
      const file = files.next();
      fileData.push({
        name: file.getName(),
        url: file.getUrl()
      });
    }
    return fileData;
  } catch (e) {
    Logger.log('Error fetching folder contents: ' + e.toString());
    return [{ name: 'Error: Unable to fetch folder contents. Check the URL and permissions.', url: '' }];
  }
}

function getFolderByIdFromUrl(folderUrl) {
  const folderId = folderUrl.split('/folders/')[1].split('?')[0];
  return DriveApp.getFolderById(folderId);
}

function mergeSlides(slideDetails, newDeckName, destinationFolderUrl) {
  try {
    const newDeck = SlidesApp.create(newDeckName);
    const newDeckId = newDeck.getId();
    const newDeckInstance = SlidesApp.openById(newDeckId);

    slideDetails.forEach(detail => {
      const slides = SlidesApp.openByUrl(detail.url).getSlides();
      slides.forEach(slide => newDeckInstance.appendSlide(slide));
    });

    // Remove the default first slide created
    newDeckInstance.getSlides()[0].remove();

    const mergedFile = DriveApp.getFileById(newDeckId);
    const destinationFolder = getFolderByIdFromUrl(destinationFolderUrl);
    mergedFile.moveTo(destinationFolder);

    return {
      mergedSlides: slideDetails,
      mergedDeckUrl: newDeckInstance.getUrl(),
      mergedDeckName: newDeckName
    };
  } catch (e) {
    Logger.log('Error merging slides: ' + e.toString());
    throw new Error('Error merging slides: ' + e.toString());
  }
}

function mergeSlidesFromUI(fileDetails, fileName, destinationFolderUrl) {
  try {
    const result = mergeSlides(fileDetails, fileName, destinationFolderUrl);
    return result;
  } catch (e) {
    Logger.log('Error in mergeSlidesFromUI: ' + e.toString());
    throw new Error('Error in mergeSlidesFromUI: ' + e.toString());
  }
}
