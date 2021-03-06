# node-jwt-ldap

Example NodeJS + JWT + Ldap using Passport

## Run OpenLdap

```bash
docker run -p 389:389 \
--name openldap \
--env LDAP_ORGANISATION="Nardy" \
--env LDAP_DOMAIN="nardy.com.br" \
--env LDAP_ADMIN_PASSWORD="admin" \
--detach osixia/openldap:1.4.0
```

## Test OpenLdap

```bash
ldapsearch -H ldap://localhost \
-b "dc=nardy,dc=com,dc=br" \
-D "cn=admin,dc=nardy,dc=com,dc=br" \
-x -w admin
```

Expected return

```
objectClass: dcObject
objectClass: organization
o: Nardy
dc: nardy

# admin, nardy.com.br
dn: cn=admin,dc=nardy,dc=com,dc=br
objectClass: simpleSecurityObject
objectClass: organizationalRole
cn: admin
description: LDAP administrator

# search result
search: 2
result: 0 Success

# numResponses: 3
# numEntries: 2
```

## Run phpLdapAdmin

```bash
docker run -p 6443:443 \
--name phpldapadmin \
--hostname phpldapadmin \
--link openldap:nardy \
--env PHPLDAPADMIN_LDAP_HOSTS=nardy \
--detach osixia/phpldapadmin:0.9.0
```

On browser access [phpLdapAdmin](https://localhost:6443)

**Login DN**: cn=admin,dc=nardy,dc=com,dc=br

**Password**: admin

## Create Group Ldap

1. In left Menu click on **Create new entry here**
2. Click on **Generic: Organisational Unit**
3. Name: rh

## Create User

1. In left Menu click on Group **rh**
2. Click on **Create a child entry**
3. Click on **Default**
4. Select **inetOrgPerson**
5. Select RDS **cn (cn)**
6. Fill the fields
    1. *cn*: user name
    2. *sn*: user name
    3. *departmentNumber*: **rh**
    4. *User Name*: user name
    4. *Password*: password

## Run app

1. Download dependencies

```bash
npm i
```

2. Run app

```bash
npm run serve
```

## Test app

Using Postman or curl

1. Generate token

**POST** localhost:3000/login

```
username: user create
password: password create
```

curl example

```bash
curl -X POST http://localhost:3000/login \
-H "Content-Type: application/x-www-form-urlencoded" \
-d "username=USER CREATE&password=PASSWORD CREATE"
```

Copy the generated token.

2. Request on the protected route

**GET** localhost:3000/dash

```
Authorization: bearer Token
```

curl example

```bash
curl http://localhost:3000/dash -H "Authorization: bearer TOKEN"
```

3. Request on the protected route per department

**GET** localhost:3000/department

```
Authorization: bearer Token
```

curl example

```bash
curl http://localhost:3000/department -H "Authorization: bearer TOKEN"
```