import React from 'react'

export default function page() {
  return (
    <div className="login-page">
        <form action="" className="login-form">
            <h3>Authenticate Your Identity</h3>
            <div className="input-box">
                <p>Registered Email</p>
                <input type="email" className="input-field" required/>
            </div>
            <div className="input-box">
                <p>Password</p>
                <input type="password" className="input-field" required />
            </div>
            <div className="input-box">
                <p>Select Your Role</p>
                <select name="role" id="role" className='input-field' required>
                    <option value="champion">Champion</option>
                    <option value="champion">Owner</option>
                    <option value="champion">Admin</option>
                </select>
            </div>
            <input type="submit" value="Authenticate" className="btn-a filled-btn" />
        </form>
    </div>
  )
}
