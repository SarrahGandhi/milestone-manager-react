// backend/src/models/Vendor.js
const { supabase } = require("../config/database");

class Vendor {
  static async create(vendorData, userId) {
    const { data, error } = await supabase
      .from("vendors")
      .insert([
        {
          name: vendorData.name,
          category: vendorData.category,
          contact_name: vendorData.contactName || null,
          email: vendorData.email?.toLowerCase() || null,
          phone: vendorData.phone || null,
          website: vendorData.website || null,
          address: vendorData.address || null,
          notes: vendorData.notes || null,
          status: vendorData.status || "prospect",
          cost_estimate: vendorData.costEstimate || null,
          event_id: vendorData.eventId || null,
          user_id: userId || vendorData.userId || null,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return this.format(data);
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from("vendors")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? this.format(data) : null;
  }

  static async findAll(filters = {}, userId = null) {
    let query = supabase
      .from("vendors")
      .select("*")
      .order("name", { ascending: true });
    if (userId) query = query.eq("user_id", userId);
    if (filters.category) query = query.eq("category", filters.category);
    if (filters.status) query = query.eq("status", filters.status);
    if (filters.eventId) query = query.eq("event_id", filters.eventId);
    if (filters.search) {
      const term = `%${filters.search}%`;
      // Search across multiple fields for a better UX
      query = query.or(
        `name.ilike.${term},contact_name.ilike.${term},email.ilike.${term},phone.ilike.${term}`
      );
    }
    const { data, error } = await query;
    if (error) throw error;
    return data.map(this.format);
  }

  static async update(id, updates) {
    const db = {};
    Object.entries(updates).forEach(([k, v]) => {
      switch (k) {
        case "contactName":
          db.contact_name = v;
          break;
        case "costEstimate":
          db.cost_estimate = v;
          break;
        case "eventId":
          db.event_id = v;
          break;
        case "userId":
          db.user_id = v;
          break;
        default:
          db[k] = v;
      }
    });
    if (db.email) db.email = db.email.toLowerCase();
    const { data, error } = await supabase
      .from("vendors")
      .update(db)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return this.format(data);
  }

  static async delete(id) {
    const { error } = await supabase.from("vendors").delete().eq("id", id);
    if (error) throw error;
    return true;
  }

  static format(row) {
    if (!row) return null;
    const v = { ...row };
    if (v.contact_name) {
      v.contactName = v.contact_name;
      delete v.contact_name;
    }
    if (Object.prototype.hasOwnProperty.call(v, "cost_estimate")) {
      v.costEstimate = v.cost_estimate;
      delete v.cost_estimate;
    }
    if (v.event_id) {
      v.eventId = v.event_id;
      delete v.event_id;
    }
    if (v.user_id) {
      v.userId = v.user_id;
      delete v.user_id;
    }
    return v;
  }
}

module.exports = Vendor;
