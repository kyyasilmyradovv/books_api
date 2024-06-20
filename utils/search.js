const { Op, Sequelize } = require('sequelize');

exports.search = (keyword) => {
  if (keyword?.length) {
    return {
      similaritySearch: {
        [Op.iLike]: `%${keyword}%`,
      },
    };
  } else {
    return {};
  }
};
