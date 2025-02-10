import styles from './styles/ProfileCard.module.css';

const ProfileCard = ({ user, onEdit }) => (
  <div className={styles.card}>
    <img src={user.avatar} alt={`${user.name}'s avatar`} className={styles.avatar} />
    <h2 className={styles.name}>{user.name}</h2>
    <p className={styles.email}>{user.email}</p>
    <p className={styles.bio}>{user.bio}</p>
    <button onClick={onEdit} className={styles.editButton}>Edit Profile</button>
  </div>
);

export default ProfileCard;
