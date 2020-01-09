import * as path from 'path';
import * as Sequelize from 'sequelize';

export default function defineUser(
  sequelize: Sequelize.Sequelize,
  DataTypes: any
) {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        validate: {
          isNumeric: true,
        },
      },
      agencyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: 'composite_key',
        validate: {
          isNumeric: true,
        },
        field: 'agency_id',
      },
      email: {
        type: DataTypes.STRING(80),
        allowNull: false,
        unique: 'composite_key',
        validate: {
          isEmail: true,
          notEmpty: true,
          len: [1, 80],
        },
      },
      password: {
        type: DataTypes.STRING(512),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      firstName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 50],
        },
        field: 'first_name',
      },
      lastName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: false,
          len: [1, 50],
        },
        field: 'last_name',
      },
      phone: {
        type: DataTypes.STRING(30),
        allowNull: true,
        validate: {
          notEmpty: true,
          len: [0, 30],
        },
      },
      title: {
        type: DataTypes.STRING(50),
        allowNull: true,
        validate: {
          notEmpty: true,
          len: [0, 50],
        },
      },
      department: {
        type: DataTypes.STRING(50),
        allowNull: true,
        validate: {
          notEmpty: true,
          len: [0, 50],
        },
      },
      isSiteAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_site_admin',
      },
      signature: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      signatureFileURL: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        field: 'signature_file_url',
      },
      isWelcomeEmailSent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_welcome_email_sent',
      },
      emailToken: {
        type: DataTypes.STRING(512),
        allowNull: true,
        field: 'email_token',
      },
      emailTokenExpiry: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'email_token_expiry',
      },
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_login',
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'is_active',
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at',
      },
      deletedAt: {
        type: DataTypes.DATE,
        field: 'deleted_at',
      },
    },
    {
      tableName: 'users',
      deletedAt: 'deleted_at',
      indexes: [
        {
          unique: true,
          name: 'user_email_composite_key',
          fields: [sequelize.fn('lower', sequelize.col('email')), 'agency_id'],
        },
      ],
    }
  );

  const UserXercePermission = sequelize.import(
    path.join(__dirname, 'userXercePermission')
  );
  User.hasOne(UserXercePermission, {
    as: 'xercePermission',
    foreignKey: 'userId',
    onDelete: 'CASCADE',
  });

  const UserXerceViolationTypePermission = sequelize.import(
    path.join(__dirname, 'userXerceViolationTypePermission')
  );
  User.hasMany(UserXerceViolationTypePermission, {
    as: 'violationTypePermissions',
    foreignKey: 'userId',
    onDelete: 'CASCADE',
  });

  const EmailHistory = sequelize.import(path.join(__dirname, 'emailHistory'));
  User.hasMany(EmailHistory, {
    as: 'emailHistories',
    foreignKey: 'userId',
    onDelete: 'CASCADE',
  });

  return User;
}
