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

	db.Find(&UserTable{})

	return dbops{db}
}

func (d dbops) CreateUser(user *UserInput, provider *UserProviderInput) {
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
}

func (d dbops) GetUser(id string) (*UserTable, error) {
	var user UserTable
	result := d.db.Where("id = ?", id).First(&user)
	if result.Error != nil {
		return nil, result.Error
	}
	return &user, nil
}
