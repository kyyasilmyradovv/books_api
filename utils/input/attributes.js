const models = require('../../models');

exports.atts = {
  book: [
    'uuid',
    'username',
    'name',
    'surname',
    'accesses',
    'createdAt',
    'isActive',
  ],
  user: [
    'uuid',
    'username',
    'name',
    'surname',
    'phone',
    'mobileDevice',
    'isActive',
    'createdAt',
  ],
};

exports.book_includes = (tables) => {
  let includes = [];
  if (tables.includes('releasePlatform')) {
    includes.push({
      model: models.MoviePlatforms,
      as: 'releasePlatform',
      attributes: ['uuid', 'nameTm', 'nameRu'],
    });
  }

  return includes;
};
