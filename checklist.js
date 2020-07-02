const getChecklist = (diff, mappings) => {
  let checklist = []

  if (diff && mappings) {
    const diffInLowerCase = diff.toLowerCase();

    mappings && mappings.forEach(mapping => {
      const keywords = mapping.keywords
      for (let i = 0; i < keywords.length; i++) {
        if (diffInLowerCase.includes(keywords[i].toLowerCase())) {
          checklist.push(mapping.comment)
          break;
        }
      }
    })
  }

  return checklist;
}

const getFormattedChecklist = (checklist) => {
  let formattedChecklist = '';
  if (checklist.length > 0) {
    formattedChecklist = '**Checklist:**'

    for (let i = 0; i < checklist.length; i++) {
      formattedChecklist += '\n';
      formattedChecklist += '- [ ] ' + checklist[i];
    }
  }
  return formattedChecklist;
}

const getFinalChecklist = (diff, mappings) => {
  let checklist = getChecklist(diff, mappings);
  let formattedChecklist = getFormattedChecklist(checklist);
  return formattedChecklist;
}

const getOnlyAddedLines = diff => {
  let newLines = ''

  if (diff != null) {
    const arr = diff.split('\n')
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].startsWith('+')) {
        newLines = newLines.concat(arr[i], '\n')
      }
    }
  } else {
    return null;
  }

  return newLines;
}

module.exports = {
  getFinalChecklist,
  getChecklist,
  getFormattedChecklist,
  getOnlyAddedLines
}
