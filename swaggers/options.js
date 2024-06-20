const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Books',
      version: '1.0.0',
      description: 'Books project API documentation.',
      contact: {
        name: 'Kyyas Ilmyradov',
        email: 'kyyas.ilmyradov@gmail.com',
      },
    },
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT}`,
      variables: {
        host: {
          enum: ['localhost'],
          default: 'localhost',
        },
        port: {
          default: process.env.PORT,
        },
      },
    },
  ],
  apis: [`${__dirname}/*.yaml`, `${__dirname}/*/*.yaml`],
};

const specs = require('swagger-jsdoc')(options);
let paginationParameters = [
  {
    in: 'query',
    name: 'limit',
    schema: {
      type: 'integer',
    },
    description: 'Limit for pagination',
  },
  {
    in: 'query',
    name: 'offset',
    schema: {
      type: 'integer',
    },
    description: 'Offset for pagination',
  },
];

for (path of Object.values(specs.paths)) {
  for (key of Object.keys(path)) {
    path[key].security = [{ Token: [] }];
    if (!path[key].responses) path[key].responses = {};
    path[key].responses[401] = {
      $ref: '#/components/responses/UnauthorizedError',
    };
    path[key].responses[498] = {
      $ref: '#/components/responses/InvalidTokenError',
    };
    path[key].responses[403] = {
      $ref: '#/components/responses/NoAccessError',
    };

    if (
      path[key]?.statuses?.includes(200) &&
      path[key]?.description?.startsWith('Edit')
    ) {
      path[key].responses[200] = {
        description:
          'An object which consists edited ' +
          path[key].tags[0]
            .slice(0, path[key].tags[0].length - 1)
            .toLowerCase() +
          ' information',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/' + path[key].tags[0],
            },
          },
        },
      };
    }

    if (path[key]?.description?.startsWith('Returns')) {
      if (path[key].parameters) {
        path[key].parameters.push(...paginationParameters);
      } else {
        path[key].parameters = paginationParameters;
      }
    }

    if (path[key].statuses.includes(201)) {
      path[key].responses[201] = {
        description:
          'An object which consists new created ' +
          path[key].tags[0].slice(0, path[key].tags[0].length - 1) +
          ' information',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/' + path[key].tags[0],
            },
          },
        },
      };
    }

    if (path[key].statuses.includes(204)) {
      path[key].responses[204] = {
        $ref: '#/components/responses/NoContent',
      };
    }

    if (path[key].statuses.includes(400)) {
      path[key].responses[400] = {
        $ref: '#/components/responses/InvalidCredentialsError',
      };
    }

    if (path[key].statuses.includes(404)) {
      path[key].responses[404] = {
        $ref: '#/components/responses/NotFoundError',
      };
    }

    if (path[key].statuses.includes(409)) {
      path[key].responses[409] = {
        $ref: '#/components/responses/ConflictError',
      };
    }

    if (path[key].statuses.includes(413)) {
      path[key].responses[413] = {
        $ref: '#/components/responses/LargeFileError',
      };
    }
  }
}

module.exports = specs;
