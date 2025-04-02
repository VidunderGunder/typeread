package database

import (
	"errors"
	"log"
	"time"

	"github.com/markbates/goth"
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
	db.AutoMigrate(&UserDataTable{})

	return dbops{db}
}

func (d dbops) UpsertUser(user goth.User) int {
	userInput := &UserTable{
		Email:       user.Email,
		Name:        user.Name,
		FirstName:   user.FirstName,
		LastName:    user.LastName,
		NickName:    user.NickName,
		Description: user.Description,
		AvatarURL:   user.AvatarURL,
		Location:    user.Location,
	}
	provider := &UserProviderTable{
		UId:               user.UserID,
		Provider:          user.Provider,
		AccessToken:       user.AccessToken,
		AccessTokenSecret: user.AccessTokenSecret,
		RefreshToken:      user.RefreshToken,
		ExpiresAt:         user.ExpiresAt,
		IDToken:           user.IDToken,
	}

	var oldProvider UserProviderTable
	result := d.db.Where("uid = ?", user.UserID).First(&oldProvider)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		// Oppretter brukeren hvis den ikke finnes
		d.db.Create(&userInput)

		provider.UserID = int(userInput.ID)
		provider.ID = oldProvider.ID
		d.db.Save(&provider)

		return int(userInput.ID)
	} else if result.Error != nil {
		log.Printf("Database error: %v", result.Error)
		return 0 // Eller annen feilhåndtering
	} else {
		provider.UserID = oldProvider.UserID
		provider.ID = oldProvider.ID
		d.db.Save(&provider)
	}

	return int(oldProvider.UserID)
}

func (d dbops) GetUser(id int) (*UserTable, error) {
	var user UserTable
	result := d.db.Where("id = ?", id).First(&user)
	if result.Error != nil {
		return nil, result.Error
	}
	return &user, nil
}

func (d dbops) IsRefreshTokenValid(refreshToken string) bool {
	var UserData UserDataTable
	result := d.db.Where("refresh_token = ?", refreshToken).First(&UserData)
	if result.Error != nil {
		return false
	}
	return UserData.RefreshToken == refreshToken && UserData.RefreshTokenExpiresAt.After(time.Now())
}

func (d dbops) RevokeRefreshToken(id int) {
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

func (d dbops) StoreRefreshToken(id int, refreshToken string, expiresAt time.Time) error {
	var user UserTable
	result := d.db.Where("id = ?", id).First(&user)
	if result.Error != nil {
		return result.Error
	}

	userData := UserDataTable{}
	d.db.Where("user_id = ?", user.ID).First(&userData)

	userData = UserDataTable{
		ID:                    userData.ID,
		UserID:                int(user.ID),
		RefreshToken:          refreshToken,
		RefreshTokenExpiresAt: expiresAt,
	}

	d.db.Save(&userData)

	return nil

}
