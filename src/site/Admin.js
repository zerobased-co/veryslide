import React from 'react';

//import * as ROLES from './constants/roles';

const AdminPage = () => (
  <div>
    <h2>Admin</h2>
    <p>
      Restricted area! Only users with the admin role are authorized.
    </p>
  </div>
);

//const condition = authUser =>
//  authUser && !!authUser.roles[ROLES.ADMIN];

export default AdminPage;