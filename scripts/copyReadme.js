// @ts-check
const fs = require('fs');
const path = require('path');

const startComment = '<!-- start shared -->';
const endComment = '<!-- end shared -->';

const mainReadmePath = path.resolve(__dirname, '../README.md');
const children = ['just-task', 'just-scripts'];

const mainReadmeContent = fs.readFileSync(mainReadmePath, 'utf8');

function getSharedContent(content, readmePath) {
  if (!content.includes(startComment) || !content.includes(endComment)) {
    console.error(`Marker comments were deleted from ${readmePath} !`);
    console.error(
      'Please add them back in the following format around content that should be shared between packages:',
    );
    console.error(startComment);
    console.error(endComment);
    process.exit(1);
  }
  return content.split('<!-- start shared -->')[1].split('<!-- end shared -->')[0];
}

const sharedContent = getSharedContent(mainReadmeContent, mainReadmePath);

for (const childPkg of children) {
  const childReadmePath = path.resolve(__dirname, `../packages/${childPkg}/README.md`);
  const childReadmeContent = fs.readFileSync(childReadmePath, 'utf8');
  const oldSharedContent = getSharedContent(childReadmeContent, childReadmePath);
  const newChildReadmeContent = childReadmeContent.replace(oldSharedContent, sharedContent);
  fs.writeFileSync(childReadmePath, newChildReadmeContent);
}
