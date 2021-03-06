angular.module('reg')
    .controller('AdminLessonsCtrl', [
        '$scope',
        '$sce',
        'LessonsService',
        'SettingsService',
        function ($scope, $sce, LessonsService, SettingsService) {

            $scope.settings = {};

            $scope.lessons = [];
            $scope.lesson = {};

            LessonsService
                .getAll()
                .success(function (lessons) {
                    $scope.lessons = lessons;
                    console.log(lessons)
                });

            SettingsService
                .getPublicSettings()
                .success(function (settings) {
                    updateSettings(settings);
                });

            function updateSettings(settings) {
                $scope.loading = false;
                // Format the dates in settings.
                settings.timeOpen = new Date(settings.timeOpen);
                settings.timeClose = new Date(settings.timeClose);
                settings.timeConfirm = new Date(settings.timeConfirm);
                settings.timeStart = new Date(settings.timeStart);
                settings.timeEnd = new Date(settings.timeEnd);

                $scope.settings = settings;
            }

            // Additional Options --------------------------------------

            $scope.updateAllowMinors = function () {
                SettingsService
                    .updateAllowMinors($scope.settings.allowMinors)
                    .success(function (data) {
                        $scope.settings.allowMinors = data.allowMinors;
                        const successText = $scope.settings.allowMinors ?
                            "Minors are now allowed to register." :
                            "Minors are no longer allowed to register."
                        swal("Looks good!", successText, "success");
                    });
            };

            // Whitelist --------------------------------------

            SettingsService
                .getWhitelistedEmails()
                .success(function (emails) {
                    $scope.whitelist = emails.join(", ");
                });

            $scope.updateWhitelist = function () {
                SettingsService
                    .updateWhitelistedEmails($scope.whitelist.replace(/ /g, '').split(','))
                    .success(function (settings) {
                        swal('Whitelist updated.');
                        $scope.whitelist = settings.whitelistedEmails.join(", ");
                    });
            };

            // Registration Times -----------------------------

            $scope.formatDate = function (date) {
                if (!date) {
                    return "Invalid Date";
                }

                // Hack for timezone
                return moment(date).format('dddd, MMMM Do YYYY, h:mm a') +
                    " " + date.toTimeString().split(' ')[2];
            };

            // Take a date and remove the seconds.
            function cleanDate(date) {
                return new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate(),
                    date.getHours(),
                    date.getMinutes()
                );
            }

            $scope.updateRegistrationTimes = function () {
                // Clean the dates and turn them to ms.
                let open = cleanDate($scope.settings.timeOpen).getTime();
                let close = cleanDate($scope.settings.timeClose).getTime();

                if (open < 0 || close < 0 || open === undefined || close === undefined) {
                    return swal('Oops...', 'You need to enter valid times.', 'error');
                }
                if (open >= close) {
                    swal('Oops...', 'Registration cannot open after it closes.', 'error');
                    return;
                }

                SettingsService
                    .updateRegistrationTimes(open, close)
                    .success(function (settings) {
                        updateSettings(settings);
                        swal("Looks good!", "Registration Times Updated", "success");
                    });
            };

            // Event time
            $scope.updateEventTimes = function () {
                // Clean the dates and turn them to ms.
                let start = cleanDate($scope.settings.timeStart).getTime();
                let end = cleanDate($scope.settings.timeEnd).getTime();

                if (start < 0 || end < 0 || start === undefined || end === undefined) {
                    return swal('Oops...', 'You need to enter valid times.', 'error');
                }
                if (start >= end) {
                    swal('Oops...', 'Registration cannot open after it closes.', 'error');
                    return;
                }

                SettingsService
                    .updateEventTimes(start, end)
                    .success(function (settings) {
                        updateSettings(settings);
                        swal("Looks good!", "Event Times Updated", "success");
                    });
            };

            // Confirmation Time -----------------------------

            $scope.updateConfirmationTime = function () {
                var confirmBy = cleanDate($scope.settings.timeConfirm).getTime();

                SettingsService
                    .updateConfirmationTime(confirmBy)
                    .success(function (settings) {
                        updateSettings(settings);
                        swal("Sounds good!", "Confirmation Date Updated", "success");
                    });
            };

            // Acceptance / Confirmation Text ----------------

            var converter = new showdown.Converter();

            $scope.markdownPreview = function (text) {
                return $sce.trustAsHtml(converter.makeHtml(text));
            };

            $scope.updateWaitlistText = function () {
                var text = $scope.settings.waitlistText;
                SettingsService
                    .updateWaitlistText(text)
                    .success(function (data) {
                        swal("Looks good!", "Waitlist Text Updated", "success");
                        updateSettings(data);
                    });
            };

            $scope.updateAcceptanceText = function () {
                var text = $scope.settings.acceptanceText;
                SettingsService
                    .updateAcceptanceText(text)
                    .success(function (data) {
                        swal("Looks good!", "Acceptance Text Updated", "success");
                        updateSettings(data);
                    });
            };

            $scope.updateConfirmationText = function () {
                var text = $scope.settings.confirmationText;
                SettingsService
                    .updateConfirmationText(text)
                    .success(function (data) {
                        swal("Looks good!", "Confirmation Text Updated", "success");
                        updateSettings(data);
                    });
            };

            $scope.updateLesson = function (lesson) {
                _updateLesson(lesson);
            };
            $scope.createLesson = function (lesson) {
                _createLesson(lesson);
            };

            function _updateLesson(lesson, e) {
                LessonsService
                    .updateLesson(lesson)
                    .success(function (data) {
                        //_successModal();
                    })
                    .error(function (res) {
                        sweetAlert("Uh oh!", "Something went wrong.", "error");
                        $scope.submitButtonDisabled = false;
                    });
            }

            function _createLesson(lesson, e) {
                LessonsService
                    .createLesson(lesson)
                    .success(function (data) {
                        console.log(data);
                        $scope.lessons.push(data.lesson);
                        $scope.lesson = {};
                    })
                    .error(function (res) {
                        sweetAlert("Uh oh!", "Something went wrong.", "error");
                        $scope.submitButtonDisabled = false;
                    });
            }

        }]);