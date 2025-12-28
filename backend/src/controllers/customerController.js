import Customer from '../models/Customer.js';
import pool from '../config/database.js';

export const getCustomers = async (req, res, next) => {
  try {
    const filters = {
      search: req.query.search,
      limit: req.query.limit ? parseInt(req.query.limit) : 100,
      offset: req.query.offset ? parseInt(req.query.offset) : 0
    };

    const customers = await Customer.findAll(filters);
    res.json({ customers });
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Get related data
    const [vehicles, serviceRecords, stats] = await Promise.all([
      Customer.getVehicles(req.params.id),
      Customer.getServiceRecords(req.params.id),
      Customer.getStats(req.params.id)
    ]);

    res.json({
      customer: {
        ...customer,
        vehicles,
        serviceRecords,
        stats
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req, res, next) => {
  try {
    const customerData = {
      ...req.body,
      created_by: req.user.id
    };
    const customer = await Customer.create(customerData);
    res.status(201).json({ customer });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.update(req.params.id, req.body);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ customer });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req, res, next) => {
  try {
    await Customer.delete(req.params.id);
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const addVehicle = async (req, res, next) => {
  try {
    const vehicle = await Customer.addVehicle(req.params.id, req.body);
    res.status(201).json({ vehicle });
  } catch (error) {
    next(error);
  }
};

export const addServiceRecord = async (req, res, next) => {
  try {
    const serviceData = {
      ...req.body,
      customer_id: req.params.id,
      performed_by: req.user.id
    };
    const serviceRecord = await Customer.addServiceRecord(serviceData);
    res.status(201).json({ serviceRecord });
  } catch (error) {
    next(error);
  }
};

export const updateServiceRecord = async (req, res, next) => {
  try {
    const serviceRecord = await Customer.updateServiceRecord(req.params.serviceRecordId, req.body);
    if (!serviceRecord) {
      return res.status(404).json({ error: 'Service record not found' });
    }
    res.json({ serviceRecord });
  } catch (error) {
    next(error);
  }
};

export const deleteServiceRecord = async (req, res, next) => {
  try {
    await Customer.deleteServiceRecord(req.params.serviceRecordId);
    res.json({ message: 'Service record deleted successfully' });
  } catch (error) {
    next(error);
  }
};


