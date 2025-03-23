package database

import (
	"time"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type UserTable struct {
	ID          uint `gorm:"primarykey;autoIncrement"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
	Email       string `gorm:"unique;not null"`
	Name        string `grom:"not null"`
	FirstName   string
	LastName    string
	NickName    string
	Description string
	AvatarURL   string
	Location    string
}
type UserInput struct {
	Email       string
	Name        string
	FirstName   string
	LastName    string
	NickName    string
	Description string
	AvatarURL   string
	Location    string
}

type UserDataTable struct {
	ID                    uint `gorm:"primarykey;autoIncrement"`
	CreatedAt             time.Time
	UpdatedAt             time.Time
	UserID                int
	RefreshToken          string
	RefreshTokenExpiresAt time.Time
	PasswordHash          string
}

type UserProviderTable struct {
	ID                uint   `gorm:"primarykey;autoIncrement"`
	UId               string `gorm:"unique;not null"`
	CreatedAt         time.Time
	UpdatedAt         time.Time
	UserID            int
	User              UserTable `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Provider          string    `grom:"not null"`
	AccessToken       string
	AccessTokenSecret string
	RefreshToken      string
	ExpiresAt         time.Time
	IDToken           string
}

type UserProviderInput struct {
	UserID            int
	UId               string
	Provider          string
	AccessToken       string
	AccessTokenSecret string
	RefreshToken      string
	ExpiresAt         time.Time
	IDToken           string
}
type dbops struct {
	db *gorm.DB
}

func DatabaseInit() dbops {
	db, err := gorm.Open(sqlite.Open("tmp.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	db.AutoMigrate(&UserTable{})
	db.AutoMigrate(&UserProviderTable{})

	return dbops{db}
}

func (d dbops) CreateUser(user *UserInput, provider *UserProviderInput) int {
	userInput := UserTable{
		Email:       user.Email,
		Name:        user.Name,
		FirstName:   user.FirstName,
		LastName:    user.LastName,
		NickName:    user.NickName,
		Description: user.Description,
		AvatarURL:   user.AvatarURL,
		Location:    user.Location,
	}

	var oldProvider UserProviderTable
	d.db.Where("UId = ?", provider.UId).First(&UserProviderTable{})
	if oldProvider.UserID != 0 {
		d.db.Create(&userInput)
		d.db.Create(&UserProviderTable{
			UId:               provider.UId,
			Provider:          provider.Provider,
			AccessToken:       provider.AccessToken,
			AccessTokenSecret: provider.AccessTokenSecret,
			RefreshToken:      provider.RefreshToken,
			ExpiresAt:         provider.ExpiresAt,
			IDToken:           provider.IDToken,
			UserID:            int(userInput.ID),
		})

		return int(userInput.ID)
	} else {
		return int(oldProvider.UserID)
	}

}

func (d dbops) GetUser(id string) (*UserTable, error) {
	var user UserTable
	result := d.db.Where("id = ?", id).First(&user)
	if result.Error != nil {
		return nil, result.Error
	}
	return &user, nil
}

func (d dbops) IsRefreshTokenValid(id string, refreshToken string) bool {
	var user UserTable
	result := d.db.Where("id = ?", id).First(&user)
	if result.Error != nil {
		return false
	}
	var UserData UserDataTable
	result = d.db.Where("user_id = ?", user.ID).First(&UserData)
	if result.Error != nil {
		return false
	}
	return UserData.RefreshToken == refreshToken && UserData.RefreshTokenExpiresAt.After(time.Now())
}

func (d dbops) RevokeRefreshToken(id string, refreshToken string) {
	var user UserTable
	result := d.db.Where("id = ?", id).First(&user)
	if result.Error != nil {
		return
	}
	var UserData UserDataTable
	result = d.db.Where("user_id = ?", user.ID).First(&UserData)
	if result.Error != nil {
		return
	}
	UserData.RefreshToken = ""
	UserData.RefreshTokenExpiresAt = time.Now()
	d.db.Save(&UserData)
}

func (d dbops) StoreRefreshToken(id string, refreshToken string, expiresAt time.Time) error {
	var user UserTable
	result := d.db.Where("id = ?", id).First(&user)
	if result.Error != nil {
		return result.Error
	}
	var UserData UserDataTable
	result = d.db.Where("user_id = ?", user.ID).First(&UserData)
	if result.Error != nil {
		return result.Error
	}
	UserData.RefreshToken = refreshToken
	UserData.RefreshTokenExpiresAt = expiresAt
	UserData.UserID = int(user.ID)
	d.db.Save(&UserData)

	return nil

}
