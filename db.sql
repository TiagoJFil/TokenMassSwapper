
CREATE TABLE wallet(  
    address VARCHAR(255) NOT NULL,
    mnemonic VARCHAR(255) NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (address)
);

CREATE table replica_wallet(
    wallet_address varchar(255) not null,
    managed_by VARCHAR(255) NOT NULL,
    is_minting BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (wallet_address),
    FOREIGN KEY (wallet_address) REFERENCES wallet(address)
);
create table user_wallet(
    user_id int not null,
    wallet_address varchar(255) not null,
    PRIMARY KEY (wallet_address),
    FOREIGN KEY (wallet_address) REFERENCES wallet(address)
);

create table wallet_manager(
    id int primary key ,
    replica_count int not null,
    user_id int not null,
    wallet_address varchar(255) not null,
    FOREIGN KEY (wallet_address) REFERENCES wallet(address)
);

create table mints(
    id int primary key ,
    wallet_address varchar(255) not null,
    amount decimal(20, 2) not null,
    created_at timestamp not null,
    FOREIGN KEY (wallet_address) REFERENCES wallet(address)
);

create table mint_requests(
    id int primary key ,
    wallet_address varchar(255) not null,
    amount decimal(20, 2) not null,
    ticker varchar(255) not null,
    has_been_minted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at timestamp not null,
    FOREIGN KEY (wallet_address) REFERENCES wallet(address)
);

create table "user"(
    id int primary key ,
    username varchar(255) not null
);