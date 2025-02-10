// EditProfileForm.jsx

import { useState } from 'react';
import styles from './styles/EditProfileForm.module.css';

const EditProfileForm = ({ user, onSave, onCancel }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [bio, setBio] = useState(user.bio);
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    bio: user.bio,
  });

  const handleNameChange = (e) => {
    const newVal = e.target.value;
    setName(newVal);
    setForm({ ...form, name: newVal });
  };

  const handleEmailChange = (e) => {
    const newVal = e.target.value;
    setEmail(newVal);
    setForm({ ...form, email: newVal });
  };

  const handleBioChange = (e) => {
    const newVal = e.target.value;
    setBio(newVal);
    setForm({ ...form, bio: newVal });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...user, ...form }, userId);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={handleNameChange}
          required
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={handleEmailChange}
          required
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          name="bio"
          value={bio}
          onChange={handleBioChange}
          rows="4"
        />
      </div>
      <div className={styles.actions}>
        <button type="submit" className={styles.saveButton}>Save</button>
        <button type="button" onClick={onCancel} className={styles.cancelButton}>Cancel</button>
      </div>
    </form>
  );
};

export default EditProfileForm;
