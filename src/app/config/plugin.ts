import path from 'path';

export default {
  redis: {
    enable: true,
    path: path.resolve(__dirname, '../plugins/plugin-redis'),
  },

  sequelize: {
    enable: true,
    path: path.resolve(__dirname, '../plugins/plugin-sequelize'),
  },

  'application-http': {
    enable: true,
    path: path.resolve(__dirname, '../plugins/plugin-application-http'),
  },
};
