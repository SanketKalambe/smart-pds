const Joi = require('joi');

// Regex patterns for validation
const AADHAAR_REGEX = /^\d{12}$/;
const RATION_CARD_REGEX = /^(RC|PDS)[A-Z0-9]{8,12}$/i;
const DISTRIBUTOR_GOVT_ID_REGEX = /^(DIS|GOVT)[A-Z0-9]{6,10}$/i;
const PHONE_REGEX = /^[6-9]\d{9}$/;

// Joi schemas
const distributorRegisterSchema = Joi.object({
  name: Joi.string().required().min(2),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().pattern(PHONE_REGEX).required().messages({
    'string.pattern.base': 'Phone must be a valid 10-digit Indian mobile number.'
  }),
  distributorGovtId: Joi.string().required().trim().messages({
    'string.empty': 'Distributor Government ID is required.'
  }),
  aadhaarNumber: Joi.string().pattern(AADHAAR_REGEX).required().messages({
    'string.pattern.base': 'Aadhaar must be a 12-digit numeric code.'
  }),
  shopName: Joi.string().required(),
  shopAddress: Joi.string().required(),
  areaWard: Joi.string().optional()
});

const consumerRegisterSchema = Joi.object({
  name: Joi.string().required().min(2),
  email: Joi.string().email().allow('', null).optional(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().pattern(PHONE_REGEX).required(),
  rationCardNo: Joi.string().required().trim().messages({
    'string.empty': 'Ration Card Number is required.'
  }),
  headOfHouseholdName: Joi.string().required(),
  address: Joi.string().required(),
  assignedShopId: Joi.string().optional(),
  familyMembers: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      relation: Joi.string().required(),
      dateOfBirth: Joi.date().required(),
      aadhaarNumber: Joi.string().pattern(AADHAAR_REGEX).required().messages({
        'string.pattern.base': 'Family member Aadhaar must be a 12-digit numeric code.'
      })
    })
  ).min(1).required().messages({
    'array.min': 'At least one family member (Head of Household) must be listed.'
  })
});

const validateBody = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map(d => d.message);
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errorMessages
    });
  }
  next();
};

module.exports = {
  validateDistributorRegister: validateBody(distributorRegisterSchema),
  validateConsumerRegister: validateBody(consumerRegisterSchema),
  AADHAAR_REGEX,
  RATION_CARD_REGEX,
  DISTRIBUTOR_GOVT_ID_REGEX
};
