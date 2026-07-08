const pool = require('../config/database');

/**
 * Get dashboard statistics
 * GET /api/dashboard/stats
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Total guests
    const guestsResult = await pool.query('SELECT COUNT(*) as count FROM guests;');
    const totalGuests = parseInt(guestsResult.rows[0].count);

    // Total rooms
    const roomsResult = await pool.query('SELECT COUNT(*) as count FROM rooms;');
    const totalRooms = parseInt(roomsResult.rows[0].count);

    // Available rooms
    const availableRoomsResult = await pool.query(
      "SELECT COUNT(*) as count FROM rooms WHERE status = 'available';"
    );
    const availableRooms = parseInt(availableRoomsResult.rows[0].count);

    // Occupied rooms
    const occupiedRoomsResult = await pool.query(
      "SELECT COUNT(*) as count FROM rooms WHERE status = 'occupied';"
    );
    const occupiedRooms = parseInt(occupiedRoomsResult.rows[0].count);

    // Active stays
    const activeStaysResult = await pool.query(
      'SELECT COUNT(*) as count FROM stay_logs WHERE check_out_time IS NULL;'
    );
    const activeStays = parseInt(activeStaysResult.rows[0].count);

    // Today's check-ins
    const todayCheckInsResult = await pool.query(
      "SELECT COUNT(*) as count FROM stay_logs WHERE DATE(check_in_time) = CURRENT_DATE;"
    );
    const todayCheckIns = parseInt(todayCheckInsResult.rows[0].count);

    // Today's check-outs
    const todayCheckOutsResult = await pool.query(
      "SELECT COUNT(*) as count FROM stay_logs WHERE DATE(check_out_time) = CURRENT_DATE;"
    );
    const todayCheckOuts = parseInt(todayCheckOutsResult.rows[0].count);

    // Total revenue (today)
    const todayRevenueResult = await pool.query(`
      SELECT COALESCE(SUM(i.total_amount), 0) as total
      FROM invoices i
      WHERE DATE(i.issued_at) = CURRENT_DATE;
    `);
    const todayRevenue = parseFloat(todayRevenueResult.rows[0].total);

    // Total revenue (this month)
    const monthRevenueResult = await pool.query(`
      SELECT COALESCE(SUM(i.total_amount), 0) as total
      FROM invoices i
      WHERE DATE_TRUNC('month', i.issued_at) = DATE_TRUNC('month', CURRENT_DATE);
    `);
    const monthRevenue = parseFloat(monthRevenueResult.rows[0].total);

    // Outstanding invoices
    const outstandingResult = await pool.query(`
      SELECT COALESCE(SUM(balance_due), 0) as total
      FROM invoices
      WHERE status IN ('issued', 'partially_paid', 'overdue');
    `);
    const outstandingAmount = parseFloat(outstandingResult.rows[0].total);

    res.status(200).json({
      success: true,
      data: {
        guests: {
          total: totalGuests,
        },
        rooms: {
          total: totalRooms,
          available: availableRooms,
          occupied: occupiedRooms,
        },
        stays: {
          active: activeStays,
          todayCheckIns,
          todayCheckOuts,
        },
        revenue: {
          today: todayRevenue,
          thisMonth: monthRevenue,
          outstanding: outstandingAmount,
        },
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message,
    });
  }
};

/**
 * Get occupancy rate
 * GET /api/dashboard/occupancy
 */
exports.getOccupancyRate = async (req, res) => {
  try {
    const occupiedResult = await pool.query(
      "SELECT COUNT(*) as count FROM rooms WHERE status = 'occupied';"
    );
    const totalResult = await pool.query('SELECT COUNT(*) as count FROM rooms;');

    const occupied = parseInt(occupiedResult.rows[0].count);
    const total = parseInt(totalResult.rows[0].count);
    const occupancyRate = total > 0 ? ((occupied / total) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      data: {
        occupied,
        total,
        occupancyRate: parseFloat(occupancyRate),
      },
    });
  } catch (error) {
    console.error('Occupancy rate error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching occupancy rate',
      error: error.message,
    });
  }
};

/**
 * Get revenue report (date range)
 * GET /api/dashboard/revenue?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
exports.getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required',
      });
    }

    const query = `
      SELECT 
        DATE(issued_at) as date,
        COUNT(*) as invoice_count,
        COALESCE(SUM(total_amount), 0) as total_amount,
        COALESCE(SUM(paid_amount), 0) as paid_amount,
        COALESCE(SUM(balance_due), 0) as balance_due
      FROM invoices
      WHERE DATE(issued_at) BETWEEN $1 AND $2
      GROUP BY DATE(issued_at)
      ORDER BY DATE(issued_at) ASC;
    `;

    const result = await pool.query(query, [startDate, endDate]);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Revenue report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue report',
      error: error.message,
    });
  }
};

/**
 * Get guest statistics
 * GET /api/dashboard/guest-stats
 */
exports.getGuestStats = async (req, res) => {
  try {
    // New guests this month
    const newGuestsResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM guests
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE);
    `);
    const newGuestsThisMonth = parseInt(newGuestsResult.rows[0].count);

    // Repeat guests
    const repeatGuestsResult = await pool.query(`
      SELECT COUNT(DISTINCT guest_id) as count
      FROM reservations
      GROUP BY guest_id
      HAVING COUNT(*) > 1;
    `);
    const repeatGuests = repeatGuestsResult.rows.length;

    // Average stay duration
    const avgStayResult = await pool.query(`
      SELECT AVG(EXTRACT(DAY FROM (check_out_time - check_in_time))) as avg_days
      FROM stay_logs
      WHERE check_out_time IS NOT NULL;
    `);
    const avgStayDuration = parseFloat(avgStayResult.rows[0].avg_days || 0).toFixed(2);

    res.status(200).json({
      success: true,
      data: {
        newGuestsThisMonth,
        repeatGuests,
        avgStayDuration: parseFloat(avgStayDuration),
      },
    });
  } catch (error) {
    console.error('Guest stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching guest statistics',
      error: error.message,
    });
  }
};

/**
 * Get top rooms by revenue
 * GET /api/dashboard/top-rooms
 */
exports.getTopRooms = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const query = `
      SELECT 
        r.id,
        r.room_number,
        r.room_type,
        COUNT(s.id) as bookings,
        COALESCE(SUM(i.total_amount), 0) as total_revenue
      FROM rooms r
      LEFT JOIN stay_logs s ON r.id = s.room_id
      LEFT JOIN invoices i ON s.id = i.stay_log_id
      GROUP BY r.id, r.room_number, r.room_type
      ORDER BY total_revenue DESC
      LIMIT $1;
    `;

    const result = await pool.query(query, [limit]);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Top rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching top rooms',
      error: error.message,
    });
  }
};

/**
 * Get payment methods distribution
 * GET /api/dashboard/payment-methods
 */
exports.getPaymentMethodsDistribution = async (req, res) => {
  try {
    const query = `
      SELECT 
        payment_method,
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as total_amount
      FROM payments
      WHERE payment_status = 'completed'
      GROUP BY payment_method;
    `;

    const result = await pool.query(query);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment methods distribution',
      error: error.message,
    });
  }
};
