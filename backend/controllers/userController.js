const User = require('../models/User');
const Member = require('../models/Member');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sendEmail = require('../utils/sendEmail');

// Register user
exports.register = async (req, res) => {
  try {
    const { nama, email, password, nim } = req.body;

    // 1. Validasi: Cek apakah NIM ada di database Member (Validasi Keanggotaan)
    const memberExists = await Member.findOne({ studentId: nim });
    if (!memberExists) {
      return res.status(400).json({
        message: 'NIM tidak ditemukan dalam database anggota. Silakan hubungi admin.'
      });
    }

    // 2. Validasi: Cek apakah nama sesuai (Opsional, untuk keamanan tambahan)
    // if (memberExists.name.toLowerCase() !== nama.toLowerCase()) { ... }

    // 3. Cek apakah email sudah terdaftar sebagai User
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    // 4. Cek apakah NIM sudah terdaftar sebagai User (Akun sudah dibuat)
    user = await User.findOne({ nim });
    if (user) {
      return res.status(400).json({ message: 'Akun untuk NIM ini sudah ada' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Buat user baru
    user = new User({
      nama,
      email,
      password,
      nim,
      role: 'anggota', // Default role
      verificationToken: otp,
      verificationExpires: otpExpires
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Simpan user
    await user.save();

    // Send email
    try {
      const message = `Kode verifikasi pendaftaran akun Anda adalah: ${otp}\nKode ini akan kadaluarsa dalam 10 menit.`;
      const html = `<p>Halo ${nama},</p><p>Kode verifikasi pendaftaran akun Anda adalah: <strong>${otp}</strong></p><p>Kode ini akan kadaluarsa dalam 10 menit.</p>`;
      await sendEmail({
        email: user.email,
        subject: 'Verifikasi Akun HMPTI UNESA',
        message,
        html
      });
      res.status(201).json({ message: 'Registrasi berhasil. Silakan cek email Anda untuk kode verifikasi.', email: user.email });
    } catch (err) {
      // Jika email gagal dikirim, hapus user agar bisa daftar ulang, atau biarkan agar bisa resend
      res.status(500).json({ message: 'Registrasi berhasil tapi gagal mengirim email verifikasi', error: err.message });
    }
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cek apakah user ada
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email atau password salah' });
    }

    // Cek password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email atau password salah' });
    }

    // Cek status verifikasi
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Akun belum diverifikasi. Silakan cek email Anda.', isVerified: false });
    }

    // Buat JWT token
    const payload = {
      id: user.id,
      role: user.role
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            nama: user.nama,
            email: user.email,
            role: user.role,
            nim: user.nim
          }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { nama, email } = req.body;

    // Build update object
    const updateFields = {};
    if (nama) updateFields.nama = nama;
    if (email) updateFields.email = email;

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Ambil user dengan password
    const user = await User.findById(req.user.id);

    // Cek password saat ini
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password saat ini salah' });
    }

    // Hash password baru
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Simpan perubahan
    await user.save();

    res.json({ message: 'Password berhasil diubah' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

// Admin: Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

// Admin: Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['admin', 'pengurus', 'anggota'].includes(role)) {
      return res.status(400).json({ message: 'Role tidak valid' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Akun sudah terverifikasi' });
    }

    if (user.verificationToken !== otp) {
      return res.status(400).json({ message: 'Kode OTP salah' });
    }

    if (new Date() > user.verificationExpires) {
      return res.status(400).json({ message: 'Kode OTP sudah kadaluarsa. Silakan kirim ulang.' });
    }

    // Mark as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    // Optionally login directly
    const payload = {
      id: user.id,
      role: user.role
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          message: 'Verifikasi berhasil',
          token,
          user: {
            id: user.id,
            nama: user.nama,
            email: user.email,
            role: user.role,
            nim: user.nim
          }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

// Resend OTP
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Akun sudah terverifikasi' });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.verificationToken = otp;
    user.verificationExpires = otpExpires;
    await user.save();

    // Send email
    const message = `Kode verifikasi baru Anda adalah: ${otp}\nKode ini akan kadaluarsa dalam 10 menit.`;
    const html = `<p>Halo ${user.nama},</p><p>Kode verifikasi baru Anda adalah: <strong>${otp}</strong></p><p>Kode ini akan kadaluarsa dalam 10 menit.</p>`;
    
    await sendEmail({
      email: user.email,
      subject: 'Kode Verifikasi Baru HMPTI UNESA',
      message,
      html
    });

    res.json({ message: 'Kode OTP baru telah dikirim ke email Anda' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
}; 