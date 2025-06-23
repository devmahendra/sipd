function mapUserDetails(existingData) {
    return {
      users: {
        username: existingData.username,
        password: existingData.password,
        status: existingData.status
      },
      user_profile: {
        firstName: existingData.first_name,
        lastName: existingData.last_name,
        email: existingData.email,
        phoneNumber: existingData.phone_number,
        avatarUrl: existingData.avatar_url
      },
      user_branch: {
        branchId: existingData.role_id
      },
      user_roles: {
        roleId: existingData.role_id
      }
    };
  }
  
  module.exports = mapUserDetails;
  